"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getPublicApiBaseUrl,
  isLocalApiBaseUrl,
  normalizeApiBaseUrl,
} from "@/lib/api";
import type { GameLogEvent, MatchLogsResponse, MatchResult } from "@/lib/types";
import { GameProcessLog } from "@/components/game-process-log";
import { PlayerCardGrid } from "@/components/player-card-grid";
import type { RoundDetailData, RoundEventType } from "@/components/round-detail";
import { ResultSummaryHero } from "@/components/result-summary-hero";
import { ResultSummaryHighlights } from "@/components/result-summary-highlights";
import {
  buildDemoFallback,
  buildResultPresentation,
  normalizeMatchResult,
} from "@/components/result-summary-model";
import { RoundTimeline } from "@/components/round-timeline";

type LoadState = "loading" | "ready" | "error";

function classifyRoundEvent(event: string): RoundEventType {
  const lowerEvent = event.toLowerCase();

  if (
    lowerEvent.includes("eliminated") ||
    lowerEvent.includes("removed") ||
    lowerEvent.includes("out") ||
    lowerEvent.includes("淘汰")
  ) {
    return "elimination";
  }

  if (
    lowerEvent.includes("voted") ||
    lowerEvent.includes("vote") ||
    lowerEvent.includes("投票")
  ) {
    return "vote";
  }

  if (
    lowerEvent.includes("remaining") ||
    lowerEvent.includes("survive") ||
    lowerEvent.includes("status") ||
    lowerEvent.includes("score") ||
    lowerEvent.includes("剩余")
  ) {
    return "status";
  }

  return "event";
}

function convertRoundLogsToDetails(
  roundLogs: MatchResult["round_logs"]
): RoundDetailData[] {
  return roundLogs.map((round) => ({
    id: round.round,
    events: round.events.map((event) => ({
      text: event,
      type: classifyRoundEvent(event),
    })),
    remainingPlayers: round.remaining_players,
    chats: [],
    predictions: [],
    actions: round.events
      .filter((event) => {
        const eventType = classifyRoundEvent(event);
        return eventType === "elimination" || eventType === "vote";
      })
      .map((event) => ({
        player: `Round ${round.round}`,
        action: event,
      })),
    observations: [
      ...round.events.map((event, index) => ({
        label: `Event ${index + 1}`,
        value: event,
      })),
      {
        label: "Remaining Players",
        value:
          round.remaining_players.length > 0
            ? round.remaining_players.join(", ")
            : "No remaining players recorded.",
      },
    ],
  }));
}

function resolveApiBaseUrl(apiBaseParam: string | null) {
  if (apiBaseParam) {
    return normalizeApiBaseUrl(apiBaseParam);
  }

  if (typeof window !== "undefined") {
    const savedApiBase = window.localStorage.getItem("socialcompact-api-base");

    if (savedApiBase) {
      return normalizeApiBaseUrl(savedApiBase);
    }
  }

  return getPublicApiBaseUrl();
}

export function ResultsClient() {
  const searchParams = useSearchParams();
  const explicitMatchId = searchParams.get("matchId");
  const matchId = explicitMatchId ?? "mock-match-001";
  const apiBaseParam = searchParams.get("apiBase");
  const apiBase = resolveApiBaseUrl(apiBaseParam);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [processEvents, setProcessEvents] = useState<GameLogEvent[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    if (apiBaseParam) {
      window.localStorage.setItem("socialcompact-api-base", apiBase);
    }

    if (!explicitMatchId) {
      return;
    }

    let cancelled = false;

    async function loadResult() {
      setLoadState((currentState) =>
        currentState === "ready" ? "ready" : "loading"
      );

      try {
        const response = await fetch(
          `${apiBase}/api/results/${encodeURIComponent(matchId)}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }

        const payload = (await response.json()) as Partial<MatchResult> &
          Pick<
            MatchResult,
            "match_id" | "game" | "rounds" | "winner" | "players" | "summary"
          >;

        if (!cancelled) {
          setResult(normalizeMatchResult(payload));
          setLoadState("ready");
          setErrorMessage("");
        }

        try {
          const logsResponse = await fetch(
            `${apiBase}/api/matches/${encodeURIComponent(matchId)}/logs`,
            {
              cache: "no-store",
            }
          );

          if (!logsResponse.ok) {
            return;
          }

          const logsPayload = (await logsResponse.json()) as MatchLogsResponse;

          if (!cancelled) {
            setProcessEvents(logsPayload.events);
          }
        } catch {
          // Result data is more important than logs. Keep the page usable if
          // the log endpoint is temporarily unavailable.
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Unable to load result.";
          setResult(null);
          setProcessEvents([]);
          setLoadState("error");
          setErrorMessage(message);
        }
      }
    }

    loadResult();

    return () => {
      cancelled = true;
    };
  }, [apiBase, apiBaseParam, explicitMatchId, matchId, refreshIndex]);

  useEffect(() => {
    if (result?.status !== "running") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setRefreshIndex((currentIndex) => currentIndex + 1);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [result?.status]);

  const displayResult = explicitMatchId ? result : buildDemoFallback(matchId);
  const displayLoadState = explicitMatchId ? loadState : "ready";

  if (displayLoadState === "loading" && displayResult === null) {
    return <LoadingResult matchId={matchId} apiBase={apiBase} />;
  }

  if (displayLoadState === "error" || displayResult === null) {
    return (
      <MissingResult
        matchId={matchId}
        apiBase={apiBase}
        errorMessage={errorMessage}
      />
    );
  }

  const presentation = buildResultPresentation(displayResult);
  const isRunning = displayResult.status === "running";
  const isFailed = displayResult.status === "failed";
  const roundDetails = convertRoundLogsToDetails(displayResult.round_logs);
  const backendIsPublic = !isLocalApiBaseUrl(apiBase);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(250,204,21,0.12),transparent_18%),linear-gradient(135deg,#020617,#0f172a_45%,#111827)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:72px_72px] opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_60%)] blur-3xl" />

      <section className="relative mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
              SocialCOMPACT Results Overview
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Winner, score, player state cards, and match overview in one page.
            </p>
            <p className="mt-2 break-all font-mono text-xs text-slate-400">
              Backend URL: {apiBase}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-100">
              Game {displayResult.game}
            </span>
            <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-100">
              Match {displayResult.match_id}
            </span>
            {isRunning ? (
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                Auto Refresh On
              </span>
            ) : (
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
                Final Snapshot
              </span>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-8">
          {isRunning ? (
            <RunningAgentConversationHero
              result={displayResult}
              processEvents={processEvents}
            />
          ) : isFailed ? (
            <FailedResultHero result={displayResult} />
          ) : (
            <ResultSummaryHero
              result={displayResult}
              winner={presentation.winner}
              activePlayers={presentation.stats.activePlayers}
              eliminatedPlayers={presentation.stats.eliminatedPlayers}
              winnerByArenaVerdict={presentation.stats.winnerByArenaVerdict}
              hasEliminations={presentation.stats.hasEliminations}
            />
          )}

          <ResultSummaryHighlights
            result={displayResult}
            stats={presentation.stats}
          />

          <RunVerificationPanel
            result={displayResult}
            apiBase={apiBase}
            backendIsPublic={backendIsPublic}
            processEvents={processEvents}
          />

          {isRunning ? (
            <RunningProgressPanel processEvents={processEvents} />
          ) : null}

          <GameProcessLog
            events={processEvents}
            isPolling={displayResult.status === "running"}
          />

          <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
            <PlayerCardGrid
              players={presentation.players}
              winnerByArenaVerdict={presentation.stats.winnerByArenaVerdict}
            />
            <RoundTimeline rounds={roundDetails} />
          </div>
        </div>
      </section>
    </main>
  );
}

function RunningProgressPanel({
  processEvents,
}: {
  processEvents: GameLogEvent[];
}) {
  const messages = processEvents.map((event) => event.message.toLowerCase());
  const latestEvent = processEvents[processEvents.length - 1];
  const stages = [
    {
      label: "Queued",
      active: messages.some(
        (message) =>
          message.includes("match created") || message.includes("queued")
      ),
      detail: "The backend created a match id and saved the initial running result.",
    },
    {
      label: "Service Check",
      active: messages.some(
        (message) =>
          message.includes("checking arena") ||
          message.includes("service cards")
      ),
      detail: "Render Arena and Agent services are being checked and woken up.",
    },
    {
      label: "A2A Stream",
      active: messages.some(
        (message) =>
          message.includes("starting the a2a stream") ||
          message.includes("stream event")
      ),
      detail: "The backend is listening for Arena artifacts and live events.",
    },
    {
      label: "Final Artifact",
      active: messages.some(
        (message) =>
          message.includes("stream finished") ||
          message.includes("falling back") ||
          message.includes("match completed")
      ),
      detail: "The final result will replace the running snapshot once available.",
    },
  ];
  const currentStage =
    [...stages].reverse().find((stage) => stage.active)?.label ?? "Waiting";

  return (
    <section className="rounded-[32px] border border-cyan-300/16 bg-[linear-gradient(135deg,rgba(14,165,233,0.16),rgba(15,23,42,0.82))] p-6 shadow-[0_22px_90px_rgba(8,145,178,0.12)] backdrop-blur">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Real Agent Run Progress
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Current Stage: {currentStage}
          </h2>
        </div>
        <p className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
          Polling Every 3s
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {stages.map((stage) => (
          <ProgressStageCard key={stage.label} stage={stage} />
        ))}
      </div>

      {latestEvent ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/42 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Latest Signal
          </p>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">
            {latestEvent.message}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function ProgressStageCard({
  stage,
}: {
  stage: { label: string; active: boolean; detail: string };
}) {
  return (
    <article
      className={`rounded-2xl border px-4 py-4 ${
        stage.active
          ? "border-emerald-300/20 bg-emerald-300/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-[0.2em] ${
          stage.active ? "text-emerald-100" : "text-slate-400"
        }`}
      >
        {stage.active ? "Active" : "Waiting"}
      </p>
      <p className="mt-2 text-lg font-bold text-white">{stage.label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{stage.detail}</p>
    </article>
  );
}

function RunVerificationPanel({
  result,
  apiBase,
  backendIsPublic,
  processEvents,
}: {
  result: MatchResult;
  apiBase: string;
  backendIsPublic: boolean;
  processEvents: GameLogEvent[];
}) {
  const isArena = result.source === "arena";
  const isFallback = result.source === "local-fallback";
  const hasAgentArtifacts = processEvents.some((event) =>
    ["chat", "reasoning", "prediction", "decision"].includes(event.phase)
  );
  const hasArenaObservations = processEvents.some(
    (event) => event.phase === "observation"
  );
  const arenaVerdictWithoutScores =
    isArena &&
    result.status === "completed" &&
    result.players.every((player) => player.score === 0);

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <VerificationCard
        label="Backend"
        value={backendIsPublic ? "Public Render" : "Localhost"}
        tone={backendIsPublic ? "good" : "warn"}
        detail={apiBase}
      />
      <VerificationCard
        label="Run Source"
        value={isArena ? "Real Arena" : isFallback ? "Fallback" : result.source}
        tone={isArena ? "good" : isFallback ? "warn" : "neutral"}
        detail={
          isArena
            ? "The result was returned by the deployed Arena service."
            : isFallback
              ? "Arena was unavailable, so the backend used simulation. This often happens when Render free services are waking up; retry after the Arena and Agent URLs respond."
              : "This result came from the selected backend mode."
        }
      />
      <VerificationCard
        label="Visible Artifacts"
        value={
          hasAgentArtifacts
            ? "Agent reasoning"
            : arenaVerdictWithoutScores
              ? "Arena verdict"
            : hasArenaObservations
              ? "Arena observations"
              : "System logs"
        }
        tone={hasAgentArtifacts || hasArenaObservations ? "good" : "neutral"}
        detail={
          hasAgentArtifacts
            ? "Chat, prediction, or decision events were exposed."
            : arenaVerdictWithoutScores
              ? "Arena exposed a winner and public observations, but no numeric score table."
            : hasArenaObservations
              ? "Arena returned public match observations for this run."
              : "Only lifecycle messages were exposed for this run."
        }
      />
    </section>
  );
}

function VerificationCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "good" | "warn" | "neutral";
}) {
  const toneClassName =
    tone === "good"
      ? "border-emerald-300/18 bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(15,23,42,0.72))]"
      : tone === "warn"
        ? "border-amber-300/18 bg-[linear-gradient(135deg,rgba(251,191,36,0.16),rgba(15,23,42,0.72))]"
        : "border-slate-300/14 bg-white/6";

  return (
    <article
      className={`rounded-[28px] border p-5 shadow-[0_18px_60px_rgba(2,6,23,0.2)] ${toneClassName}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/65">
        {label}
      </p>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
      <p className="mt-3 break-words text-sm leading-6 text-slate-200/78">
        {detail}
      </p>
    </article>
  );
}

function LoadingResult({
  matchId,
  apiBase,
}: {
  matchId: string;
  apiBase: string;
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#020617,_#0f172a_45%,_#111827)] text-white">
      <section className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
        <div className="rounded-[32px] border border-cyan-300/20 bg-cyan-300/10 p-8 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-100">
            Loading Result
          </p>
          <h1 className="mt-4 text-4xl font-black">Connecting To Backend</h1>
          <p className="mt-4 break-all leading-7 text-cyan-50/90">
            Match {matchId} is loading from {apiBase}.
          </p>
        </div>
      </section>
    </main>
  );
}

function MissingResult({
  matchId,
  apiBase,
  errorMessage,
}: {
  matchId: string;
  apiBase: string;
  errorMessage: string;
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#020617,_#0f172a_45%,_#111827)] text-white">
      <section className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
        <div className="rounded-[32px] border border-rose-300/20 bg-[linear-gradient(145deg,rgba(190,24,93,0.18),rgba(17,24,39,0.88))] p-8 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-100">
            Result Feed Missing
          </p>
          <h1 className="mt-4 text-4xl font-black">Result Not Available</h1>
          <p className="mt-4 leading-7 text-rose-50/90">
            The frontend could not load match{" "}
            <span className="font-mono">{matchId}</span> from{" "}
            <span className="break-all font-mono">{apiBase}</span>.
          </p>
          {errorMessage ? (
            <p className="mt-4 rounded-2xl border border-rose-200/20 bg-rose-200/10 px-4 py-3 text-sm text-rose-50">
              {errorMessage}
            </p>
          ) : null}
          <Link
            href="/start"
            className="mt-8 inline-block rounded-full bg-[linear-gradient(135deg,#fb7185,#f97316)] px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
          >
            Back To Start
          </Link>
        </div>
      </section>
    </main>
  );
}

function RunningAgentConversationHero({
  result,
  processEvents,
}: {
  result: MatchResult;
  processEvents: GameLogEvent[];
}) {
  const agentEvents = processEvents.filter((event) =>
    ["chat", "prediction", "decision"].includes(event.phase)
  );
  const visibleAgentEvents = agentEvents.slice(-6);
  const latestSystemEvent = [...processEvents]
    .reverse()
    .find((event) => event.phase === "system");
  const lastAgentEvent = agentEvents[agentEvents.length - 1];
  const statusText =
    lastAgentEvent !== undefined
      ? `${formatPhaseLabel(lastAgentEvent.phase)} from ${lastAgentEvent.actor ?? "Agent"}`
      : latestSystemEvent?.message ?? result.summary;

  return (
    <section className="relative overflow-hidden rounded-[36px] border border-cyan-300/20 bg-[linear-gradient(145deg,rgba(14,165,233,0.16),rgba(15,23,42,0.9)_54%,rgba(6,78,59,0.28))] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_88%_24%,rgba(16,185,129,0.12),transparent_26%)]" />
      <div className="relative grid gap-6 xl:grid-cols-[0.92fr_1.08fr] xl:items-stretch">
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/90">
              <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2">
                Live Agent Exchange
              </span>
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-slate-200">
                Match {result.match_id}
              </span>
              <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-emerald-100">
                {result.source}
              </span>
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl">
              Agents are negotiating in real time.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              {statusText}
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <LiveMetric label="Agent Events" value={String(agentEvents.length)} />
            <LiveMetric label="Latest Round" value={String(lastAgentEvent?.round ?? 0)} />
            <LiveMetric label="Refresh" value="3s" />
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-slate-950/50 p-4 shadow-[0_18px_80px_rgba(2,6,23,0.28)] sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">
                Conversation Stream
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                Latest Agent Messages
              </h2>
            </div>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
              Live
            </span>
          </div>

          {visibleAgentEvents.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm leading-7 text-slate-300">
              Waiting for the first Agent chat or decision artifact. Service
              wake-up and Arena setup messages continue below in the process log.
            </div>
          ) : (
            <div className="mt-5 max-h-[27rem] space-y-3 overflow-y-auto pr-2">
              {visibleAgentEvents.map((event) => (
                <LiveAgentMessage key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function formatPhaseLabel(phase: string) {
  if (phase === "chat") {
    return "Chat";
  }
  if (phase === "prediction") {
    return "Prediction";
  }
  if (phase === "decision") {
    return "Decision";
  }
  return phase.replace(/_/g, " ");
}

function LiveMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function LiveAgentMessage({ event }: { event: GameLogEvent }) {
  const isChat = event.phase === "chat";
  const toneClassName = isChat
    ? "border-cyan-300/18 bg-cyan-300/10"
    : event.phase === "prediction"
      ? "border-amber-300/18 bg-amber-300/10"
      : "border-rose-300/18 bg-rose-300/10";

  return (
    <article className={`rounded-2xl border px-4 py-3 ${toneClassName}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-white/10 bg-slate-950/35 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-200">
          {formatPhaseLabel(event.phase)}
        </span>
        <span className="rounded-full border border-white/10 bg-slate-950/35 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-300">
          Round {event.round}
        </span>
        <span className="text-sm font-semibold text-cyan-100">
          {event.actor ?? "Agent"}
          {event.target ? ` -> ${event.target}` : ""}
        </span>
      </div>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-100">
        {event.message}
      </p>
    </article>
  );
}

function FailedResultHero({ result }: { result: MatchResult }) {
  return (
    <section className="rounded-[36px] border border-rose-300/20 bg-[linear-gradient(145deg,rgba(190,18,60,0.2),rgba(15,23,42,0.88))] p-8 shadow-2xl shadow-rose-950/30 backdrop-blur">
      <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-rose-100">
        <span className="rounded-full border border-rose-300/30 bg-rose-300/10 px-4 py-2">
          Match Failed
        </span>
        <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-slate-200">
          Match {result.match_id}
        </span>
        <span className="rounded-full border border-rose-300/25 bg-rose-300/10 px-4 py-2">
          {result.source}
        </span>
      </div>

      <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
        The match did not complete.
      </h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
        {result.summary}
      </p>
    </section>
  );
}

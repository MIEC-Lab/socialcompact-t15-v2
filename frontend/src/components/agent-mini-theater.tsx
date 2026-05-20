import type { CSSProperties } from "react";

import type { GameLogEvent, MatchResult } from "@/lib/types";

type AgentMiniTheaterProps = {
  result: MatchResult;
  processEvents: GameLogEvent[];
};

type AgentRole = {
  name: string;
  side: "left" | "right";
  latestChat?: GameLogEvent;
  latestReasoning?: GameLogEvent;
  latestPrediction?: GameLogEvent;
  latestDecision?: GameLogEvent;
};

type AgentTone = "copper" | "sage";

type ParsedShotAction = {
  target: string;
  shots: number;
};

type ShotCue = {
  actor: string;
  target: string;
  shots: number;
  side: "left" | "right";
  targetSide: "left" | "right";
  landed: boolean;
  damage: number | null;
};

type StageVolleyCue = {
  id: string;
  round: number;
  phase: string;
  message: string;
  shots: ShotCue[];
};

const AGENT_PHASES = ["chat", "reasoning", "prediction", "decision"] as const;
const ATTACK_EVENT_PATTERN = /^(.*?) attacks (.*?) for (\d+) damage\.$/;
const HIT_EVENT_PATTERN = /^(.*?) hit (.*?)!$/;
const MISSED_EVENT_PATTERN = /^(.*?) attacked (.*?) but missed!\.$/;

export function AgentMiniTheater({
  result,
  processEvents,
}: AgentMiniTheaterProps) {
  const agentEvents = processEvents.filter((event) =>
    AGENT_PHASES.includes(event.phase as (typeof AGENT_PHASES)[number])
  );
  const playerNames = getTheaterNames(result, processEvents);
  const [leftName, rightName] = playerNames;
  const leftAgent = buildAgentRole(leftName, "left", processEvents);
  const rightAgent = buildAgentRole(rightName, "right", processEvents);
  const latestAgentEvent = agentEvents[agentEvents.length - 1];
  const activeName = latestAgentEvent?.actor ?? "";
  const featuredReasoning =
    [...processEvents]
      .reverse()
      .find((event) => event.phase === "reasoning") ?? null;
  const featuredPrediction =
    [...processEvents]
      .reverse()
      .find((event) => event.phase === "prediction") ?? null;
  const featuredDecision =
    [...processEvents]
      .reverse()
      .find((event) => event.phase === "decision") ?? null;
  const latestSystemEvent = [...processEvents]
    .reverse()
    .find((event) => event.phase === "system");
  const latestObservation = [...processEvents]
    .reverse()
    .find((event) => event.phase === "observation");
  const stageStatus =
    latestAgentEvent !== undefined
      ? `${formatPhaseLabel(latestAgentEvent.phase)} from ${latestAgentEvent.actor ?? "Agent"}`
      : latestSystemEvent?.message ?? result.summary;
  const recentTheaterEvents = processEvents
    .filter((event) =>
      ["chat", "reasoning", "prediction", "decision", "observation"].includes(
        event.phase
      )
    )
    .slice(-8);
  const latestVolleyCue = findLatestVolleyCue(
    processEvents,
    leftAgent.name,
    rightAgent.name
  );

  const leftIsFiring =
    latestVolleyCue?.shots.some((shot) => shot.side === "left") ?? false;
  const rightIsFiring =
    latestVolleyCue?.shots.some((shot) => shot.side === "right") ?? false;
  const leftUnderFire =
    latestVolleyCue?.shots.some(
      (shot) => shot.targetSide === "left" && shot.landed
    ) ?? false;
  const rightUnderFire =
    latestVolleyCue?.shots.some(
      (shot) => shot.targetSide === "right" && shot.landed
    ) ?? false;

  return (
    <section className="relative overflow-hidden rounded-[36px] border border-cyan-300/20 bg-[linear-gradient(145deg,rgba(8,47,73,0.72),rgba(15,23,42,0.95)_42%,rgba(20,83,45,0.38))] p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur sm:p-7">
      <div className="agent-theater-stage-light absolute inset-0 opacity-75" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.72))]" />

      <div className="relative">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200/90">
              <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2">
                Agent Mini Theater
              </span>
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-slate-200">
                Match {result.match_id}
              </span>
              <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-emerald-100">
                {result.source}
              </span>
            </div>
            <h1 className="mt-5 max-w-4xl text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              Agents are on stage, thinking and talking live.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              {stageStatus}
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-3 gap-3 text-center sm:min-w-[22rem]">
            <TheaterMetric label="Events" value={String(agentEvents.length)} />
            <TheaterMetric label="Round" value={String(latestAgentEvent?.round ?? 0)} />
            <TheaterMetric label="Refresh" value="3s" />
          </div>
        </div>

        <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.72),rgba(2,6,23,0.9))] p-4 sm:p-6">
              <div className="absolute inset-x-6 bottom-24 h-px bg-cyan-200/15" />
              <div className="absolute bottom-0 left-0 right-0 h-28 bg-[linear-gradient(180deg,rgba(30,41,59,0.15),rgba(15,23,42,0.92))]" />

              <div className="relative z-10 grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(17rem,0.86fr)_minmax(0,0.92fr)] lg:items-stretch">
              <SpeechBubble
                agent={leftAgent}
                active={activeName === leftAgent.name}
              />

                <div className="relative order-last min-h-72 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.2),rgba(2,6,23,0.62))] px-4 pt-8 lg:order-none">
                  <div className="absolute inset-x-7 top-6 h-28 rounded-[34px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.22),rgba(8,47,73,0.18)_58%,transparent_76%)]" />
                  <div className="absolute inset-x-9 bottom-8 h-14 rounded-full border border-amber-100/10 bg-[repeating-linear-gradient(90deg,rgba(148,163,184,0.1)_0,rgba(148,163,184,0.1)_10%,rgba(30,41,59,0.35)_10%,rgba(30,41,59,0.35)_20%)] opacity-70" />
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-[linear-gradient(180deg,rgba(8,47,73,0.16),rgba(15,23,42,0.88))]" />
                  <div className="absolute inset-x-8 bottom-16 h-px bg-white/14" />
                  <div className="absolute left-1/2 top-5 z-10 w-[15.5rem] max-w-[calc(100%-3rem)] -translate-x-1/2 rounded-[26px] border border-white/10 bg-slate-950/55 px-5 py-3 text-center shadow-lg shadow-cyan-950/20">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-amber-100/85">
                      Dust Duel Stage
                    </p>
                    <p className="mt-1 text-[0.72rem] leading-5 text-slate-400">
                      Chatter, prediction, and gunfire track the live Arena feed.
                    </p>
                  </div>
                  {latestVolleyCue ? (
                    <div className="absolute left-1/2 top-[5.8rem] z-10 max-w-[calc(100%-3rem)] -translate-x-1/2 rounded-full border border-amber-200/18 bg-amber-200/10 px-4 py-2 text-center text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-amber-50">
                      {describeVolleyCue(latestVolleyCue)}
                    </div>
                  ) : null}
                  <div className="relative flex h-[17.5rem] items-end justify-between gap-3 pt-16">
                    <CowboyPerformer
                      agent={leftAgent}
                      active={activeName === leftAgent.name}
                      firing={leftIsFiring}
                      tone="copper"
                      underFire={leftUnderFire}
                    />
                    <ShotAnimationLayer
                      cue={latestVolleyCue}
                      key={latestVolleyCue?.id ?? "no-volley"}
                    />
                    <CowboyPerformer
                      agent={rightAgent}
                      active={activeName === rightAgent.name}
                      firing={rightIsFiring}
                      tone="sage"
                      underFire={rightUnderFire}
                    />
                  </div>
                </div>

              <SpeechBubble
                agent={rightAgent}
                active={activeName === rightAgent.name}
              />
            </div>

            <div className="relative z-10 mt-5 grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)]">
              <TheaterSignalCard
                title="Reasoning Feed"
                event={featuredReasoning}
                phase="reasoning"
                emptyText="Waiting for the first reasoning trace from an Agent."
              />
              <TheaterSignalCard
                title="Prediction Window"
                event={featuredPrediction}
                phase="prediction"
                emptyText="Waiting for prediction artifacts from Arena."
                highlighted
              />
            </div>
          </div>

          <aside className="grid gap-4">
            <TheaterSidePanel
              title="Decision Card"
              phase="decision"
              event={featuredDecision}
              emptyText="Waiting for final action artifacts."
            />
            <TheaterSidePanel
              title="Latest Observation"
              phase="observation"
              event={latestObservation ?? null}
              emptyText="Arena observations will appear after actions resolve."
            />
            <div className="rounded-[28px] border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Theater Timeline
              </p>
              {recentTheaterEvents.length === 0 ? (
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Waiting for the first live Agent artifact.
                </p>
              ) : (
                <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-2">
                  {recentTheaterEvents.map((event) => (
                    <TimelineEvent key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function getTheaterNames(result: MatchResult, events: GameLogEvent[]) {
  const eventNames = events
    .flatMap((event) => [event.actor, event.target])
    .filter((name): name is string => Boolean(name));
  const names = [...eventNames, ...result.players.map((player) => player.name)];
  const uniqueNames = Array.from(new Set(names));

  return [
    uniqueNames[0] ?? "Agent 1",
    uniqueNames.find((name) => name !== uniqueNames[0]) ?? "Agent 2",
  ];
}

function buildAgentRole(
  name: string,
  side: AgentRole["side"],
  events: GameLogEvent[]
): AgentRole {
  const ownEvents = events.filter((event) => event.actor === name);

  return {
    name,
    side,
    latestChat: [...ownEvents].reverse().find((event) => event.phase === "chat"),
    latestReasoning: [...ownEvents]
      .reverse()
      .find((event) => event.phase === "reasoning"),
    latestPrediction: [...ownEvents]
      .reverse()
      .find((event) => event.phase === "prediction"),
    latestDecision: [...ownEvents]
      .reverse()
      .find((event) => event.phase === "decision"),
  };
}

function formatPhaseLabel(phase: string) {
  if (phase === "chat") {
    return "Chat";
  }
  if (phase === "reasoning") {
    return "Reasoning";
  }
  if (phase === "prediction") {
    return "Prediction";
  }
  if (phase === "decision") {
    return "Decision";
  }
  if (phase === "observation") {
    return "Observation";
  }
  return phase.replace(/_/g, " ");
}

function formatEventMessage(message: string) {
  try {
    return JSON.stringify(JSON.parse(message), null, 2);
  } catch {
    return message;
  }
}

function TheaterMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
      <p className="whitespace-nowrap text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function SpeechBubble({ agent, active }: { agent: AgentRole; active: boolean }) {
  const latestMessage = agent.latestChat?.message;
  const pointerClassName =
    agent.side === "left"
      ? "left-10 border-r-cyan-200/18"
      : "right-10 border-l-emerald-200/18";

  return (
    <div
      className={`relative min-h-48 rounded-[28px] border p-4 shadow-[0_18px_70px_rgba(2,6,23,0.32)] transition ${
        active
          ? "border-cyan-200/35 bg-cyan-200/12"
          : "border-white/10 bg-slate-950/62"
      }`}
    >
      <div
        className={`absolute -bottom-3 h-0 w-0 border-y-[12px] border-y-transparent ${
          agent.side === "left" ? "border-r-[18px]" : "border-l-[18px]"
        } ${pointerClassName}`}
      />
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
        {agent.name}
      </p>
      <p className="mt-2 max-h-28 min-h-16 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-6 text-slate-100">
        {latestMessage ?? "Listening for the next message..."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <MiniBadge label="Chat" active={Boolean(agent.latestChat)} />
        <MiniBadge label="Think" active={Boolean(agent.latestReasoning)} />
        <MiniBadge label="Predict" active={Boolean(agent.latestPrediction)} />
        <MiniBadge label="Act" active={Boolean(agent.latestDecision)} />
      </div>
    </div>
  );
}

function MiniBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.16em] ${
        active
          ? "border-emerald-200/25 bg-emerald-200/10 text-emerald-100"
          : "border-white/10 bg-white/5 text-slate-500"
      }`}
    >
      {label}
    </span>
  );
}

function CowboyPerformer({
  agent,
  active,
  firing,
  tone,
  underFire,
}: {
  agent: AgentRole;
  active: boolean;
  firing: boolean;
  tone: AgentTone;
  underFire: boolean;
}) {
  const palette =
    tone === "copper"
      ? {
          accent: "#38bdf8",
          accentSoft: "#a5f3fc",
          belt: "#3b2f2f",
          boots: "#3f2a1d",
          coatDark: "#3b82f6",
          coatLight: "#60a5fa",
          glove: "#f4d0b2",
          gun: "#a8b3cf",
          gunDark: "#64748b",
          hair: "#3f2619",
          hatBand: "#dbeafe",
          hatDark: "#6f4327",
          hatLight: "#b97a52",
          mouth: "#7c4a2d",
          pants: "#1e293b",
          skin: "#f6d1b5",
          shirt: "#f8fafc",
        }
      : {
          accent: "#34d399",
          accentSoft: "#d1fae5",
          belt: "#253745",
          boots: "#2b2f3e",
          coatDark: "#0f766e",
          coatLight: "#2dd4bf",
          glove: "#f4d2b8",
          gun: "#b7bfd4",
          gunDark: "#64748b",
          hair: "#2f2016",
          hatBand: "#d1fae5",
          hatDark: "#70482e",
          hatLight: "#b3835f",
          mouth: "#7c4d32",
          pants: "#142334",
          skin: "#f7d4bd",
          shirt: "#f8fafc",
        };
  const performerId = toDomId(`${agent.name}-${tone}`);
  const performerClassName = [
    "agent-theater-performer",
    active ? "agent-theater-speaking" : "",
    firing ? "agent-theater-firing" : "",
    underFire ? "agent-theater-under-fire" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const faceForwardTransform =
    agent.side === "right" ? "translate(170 0) scale(-1 1)" : undefined;

  return (
    <div className="flex min-w-[9rem] flex-col items-center">
      <svg
        aria-label={`${agent.name} cowboy avatar`}
        className={`h-[13.8rem] w-[10rem] overflow-visible drop-shadow-[0_18px_26px_rgba(15,23,42,0.55)] ${performerClassName}`}
        role="img"
        style={
          {
            "--hit-direction": agent.side === "left" ? "-1" : "1",
            "--kick-direction": agent.side === "left" ? "1" : "-1",
          } as CSSProperties
        }
        viewBox="0 0 170 240"
      >
        <defs>
          <linearGradient
            id={`coat-${performerId}`}
            x1="0%"
            x2="0%"
            y1="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={palette.coatLight} />
            <stop offset="100%" stopColor={palette.coatDark} />
          </linearGradient>
          <linearGradient
            id={`hat-${performerId}`}
            x1="0%"
            x2="0%"
            y1="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={palette.hatLight} />
            <stop offset="100%" stopColor={palette.hatDark} />
          </linearGradient>
        </defs>

        <ellipse
          cx="86"
          cy="225"
          fill="rgba(15,23,42,0.55)"
          rx="44"
          ry="12"
        />

        <g transform={faceForwardTransform}>
          <path
            d="M74 156 L68 188 L59 215"
            fill="none"
            stroke={palette.pants}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="12"
          />
          <path
            d="M98 156 L102 188 L113 215"
            fill="none"
            stroke={palette.pants}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="12"
          />
          <path
            d="M52 214 H74 Q76 214 76 217 V223 H51 V217 Q51 214 52 214 Z"
            fill={palette.boots}
          />
          <path
            d="M100 214 H121 Q123 214 123 217 V223 H99 V217 Q99 214 100 214 Z"
            fill={palette.boots}
          />

          <path
            d="M67 106 Q49 127 47 159"
            fill="none"
            stroke={palette.coatDark}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="12"
          />
          <path
            d="M101 106 Q122 123 136 132"
            fill="none"
            stroke={palette.coatDark}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="12"
          />
          <circle cx="46" cy="160" fill={palette.glove} r="7.5" />
          <circle cx="138" cy="133" fill={palette.glove} r="7.5" />
          <g transform="translate(142 130)">
            <rect
              fill={palette.gun}
              height="8"
              rx="3"
              stroke={palette.gunDark}
              strokeWidth="1.5"
              width="18"
              x="0"
              y="-4"
            />
            <rect
              fill={palette.gunDark}
              height="11"
              rx="2"
              width="6"
              x="7"
              y="2"
            />
            <rect fill={palette.gunDark} height="4" rx="2" width="8" x="16" y="-2" />
          </g>

          <circle
            cx="84"
            cy="65"
            fill={palette.skin}
            r="34"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
          />
          <path
            d="M55 57 Q69 35 85 35 Q102 35 113 57 L112 47 Q85 26 58 45 Z"
            fill={palette.hair}
          />
          <ellipse cx="84" cy="27" fill={palette.hatDark} rx="45" ry="10" />
          <path
            d="M56 26 Q84 7 112 26 L112 51 Q84 44 56 51 Z"
            fill={`url(#hat-${performerId})`}
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="2"
          />
          <path
            d="M61 38 H107"
            fill="none"
            stroke={palette.hatBand}
            strokeLinecap="round"
            strokeWidth="6"
          />

          <ellipse cx="74" cy="67" fill="#0f172a" rx="5.2" ry="6.1" />
          <ellipse cx="95" cy="67" fill="#0f172a" rx="5.2" ry="6.1" />
          <circle cx="75.5" cy="64.8" fill="rgba(255,255,255,0.92)" r="1.5" />
          <circle cx="96.5" cy="64.8" fill="rgba(255,255,255,0.92)" r="1.5" />
          <path
            d="M81 75 Q84 77 87 75"
            fill="none"
            stroke="rgba(124,74,45,0.6)"
            strokeLinecap="round"
            strokeWidth="2.4"
          />

          {active ? (
            <ellipse
              className="agent-theater-mouth-shape agent-theater-mouth-pulse-active"
              cx="84"
              cy="82"
              fill={palette.mouth}
              rx="8.5"
              ry="5.2"
            />
          ) : (
            <rect
              fill={palette.mouth}
              height="5.5"
              rx="2.75"
              width="18"
              x="75"
              y="79"
            />
          )}

          <rect
            fill={`url(#coat-${performerId})`}
            height="58"
            rx="18"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="2"
            width="46"
            x="61"
            y="96"
          />
          <path d="M67 104 L84 135 L101 104" fill={palette.shirt} opacity="0.94" />
          <path
            d="M64 95 Q84 118 104 95"
            fill={palette.accent}
            opacity="0.98"
          />
          <path
            d="M64 118 Q84 109 104 118"
            fill="none"
            stroke="rgba(15,23,42,0.28)"
            strokeLinecap="round"
            strokeWidth="2"
          />
          <rect x="60" y="149" width="48" height="12" rx="6" fill={palette.belt} />
          <rect
            x="80.5"
            y="147"
            width="9"
            height="16"
            rx="3"
            fill={palette.accentSoft}
            opacity="0.9"
          />
          <path
            d="M103 154 L115 176"
            fill="none"
            stroke={palette.belt}
            strokeLinecap="round"
            strokeWidth="8"
          />
        </g>
      </svg>
      <p className="mt-3 max-w-36 truncate rounded-full border border-white/10 bg-slate-950/65 px-4 py-2 text-sm font-bold text-white">
        {agent.name}
      </p>
    </div>
  );
}

function ShotAnimationLayer({ cue }: { cue: StageVolleyCue | null }) {
  if (!cue) {
    return null;
  }

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {cue.shots.map((shot, index) => (
        <ShotAnimation
          cue={shot}
          index={index}
          key={`${cue.id}-${shot.actor}-${shot.target}-${index}`}
          total={cue.shots.length}
        />
      ))}
    </div>
  );
}

function ShotAnimation({
  cue,
  index,
  total,
}: {
  cue: ShotCue;
  index: number;
  total: number;
}) {
  const shotY = 117 + (index - (total - 1) / 2) * 13;
  const volleyScale = Math.min(1.35, 0.94 + cue.shots * 0.08);

  return (
    <div
      className="absolute inset-0"
      style={
        {
          "--shot-y": `${shotY}px`,
          "--volley-scale": volleyScale.toFixed(2),
        } as CSSProperties
      }
    >
      <div
        className={`agent-theater-muzzle-flash ${
          cue.side === "left"
            ? "agent-theater-muzzle-left"
            : "agent-theater-muzzle-right"
        }`}
      />
      <div
        className={`agent-theater-shot-trail ${
          cue.side === "left"
            ? "agent-theater-shot-trail-right"
            : "agent-theater-shot-trail-left"
        }`}
      />
      <div
        className={`agent-theater-impact-burst ${
          cue.targetSide === "left"
            ? "agent-theater-impact-left"
            : "agent-theater-impact-right"
        } ${
          cue.landed
            ? "agent-theater-impact-hit"
            : "agent-theater-impact-miss"
        }`}
      />
    </div>
  );
}

function TheaterSignalCard({
  title,
  phase,
  event,
  emptyText,
  highlighted = false,
}: {
  title: string;
  phase: string;
  event: GameLogEvent | null;
  emptyText: string;
  highlighted?: boolean;
}) {
  return (
    <article
      className={`rounded-[28px] border p-4 shadow-[0_18px_60px_rgba(2,6,23,0.2)] ${
        highlighted
          ? "border-amber-200/18 bg-[linear-gradient(145deg,rgba(251,191,36,0.12),rgba(15,23,42,0.86))]"
          : "border-violet-200/14 bg-[linear-gradient(145deg,rgba(139,92,246,0.12),rgba(15,23,42,0.84))]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className={`text-xs font-semibold uppercase tracking-[0.24em] ${
            highlighted ? "text-amber-100/85" : "text-violet-100/85"
          }`}
        >
          {title}
        </p>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-slate-300">
          {formatPhaseLabel(phase)}
        </span>
      </div>
      {event ? (
        <>
          <p className="mt-3 text-sm font-semibold text-white">
            {event.actor ?? "Agent"}
            {event.target ? ` -> ${event.target}` : ""}
          </p>
          <p className="mt-2 max-h-36 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">
            {formatEventMessage(event.message)}
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-400">{emptyText}</p>
      )}
    </article>
  );
}

function TheaterSidePanel({
  title,
  phase,
  event,
  emptyText,
}: {
  title: string;
  phase: string;
  event: GameLogEvent | null;
  emptyText: string;
}) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-slate-950/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
          {title}
        </p>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-slate-300">
          {formatPhaseLabel(phase)}
        </span>
      </div>
      {event ? (
        <>
          <p className="mt-3 text-sm font-semibold text-white">
            {event.actor ?? "Arena"}
            {event.target ? ` -> ${event.target}` : ""}
          </p>
          <p className="mt-2 max-h-44 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
            {formatEventMessage(event.message)}
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-400">{emptyText}</p>
      )}
    </article>
  );
}

function TimelineEvent({ event }: { event: GameLogEvent }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-white/10 bg-slate-950/40 px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-slate-200">
          {formatPhaseLabel(event.phase)}
        </span>
        <span className="text-xs text-slate-400">Round {event.round}</span>
      </div>
      <p className="mt-2 max-h-20 overflow-y-auto break-words text-sm leading-6 text-slate-200">
        {event.actor ? `${event.actor}: ` : ""}
        {formatEventMessage(event.message)}
      </p>
    </article>
  );
}

function describeVolleyCue(cue: StageVolleyCue) {
  if (cue.shots.length === 1) {
    const shot = cue.shots[0];
    const shotLabel = shot.shots > 1 ? `${shot.shots} shots` : "1 shot";

    return `${shot.actor} fires ${shotLabel} at ${shot.target}`;
  }

  const actors = Array.from(new Set(cue.shots.map((shot) => shot.actor)));

  if (actors.length > 1) {
    return `Crossfire in round ${cue.round}`;
  }

  return `${actors[0] ?? "An Agent"} opens a volley`;
}

function findLatestVolleyCue(
  events: GameLogEvent[],
  leftName: string,
  rightName: string
) {
  const reversedEvents = [...events].reverse();

  for (const event of reversedEvents) {
    const shots = getShotCuesFromEvent(event, leftName, rightName);

    if (shots.length > 0) {
      return {
        id: event.id,
        message: event.message,
        phase: event.phase,
        round: event.round,
        shots,
      } satisfies StageVolleyCue;
    }
  }

  return null;
}

function getShotCuesFromEvent(
  event: GameLogEvent,
  leftName: string,
  rightName: string
) {
  if (event.phase === "decision") {
    return getDecisionShotCues(event, leftName, rightName);
  }

  if (event.phase === "observation") {
    return getObservationShotCues(event.message, leftName, rightName);
  }

  return [];
}

function getDecisionShotCues(
  event: GameLogEvent,
  leftName: string,
  rightName: string
) {
  if (!event.actor) {
    return [];
  }

  return parseDecisionActions(event.message)
    .map((action) =>
      toShotCue(event.actor ?? "", action.target, action.shots, true, null, leftName, rightName)
    )
    .filter((shot): shot is ShotCue => Boolean(shot));
}

function getObservationShotCues(
  message: string,
  leftName: string,
  rightName: string
) {
  const shots: ShotCue[] = [];
  const seenKeys = new Set<string>();

  for (const line of splitEventLines(message)) {
    let cue: ShotCue | null = null;
    const attackMatch = line.match(ATTACK_EVENT_PATTERN);
    const hitMatch = line.match(HIT_EVENT_PATTERN);
    const missedMatch = line.match(MISSED_EVENT_PATTERN);

    if (attackMatch) {
      const [, actor, target, rawDamage] = attackMatch;

      cue = toShotCue(
        actor,
        target,
        1,
        Number(rawDamage) > 0,
        Number(rawDamage),
        leftName,
        rightName
      );
    } else if (hitMatch) {
      const [, actor, target] = hitMatch;

      cue = toShotCue(actor, target, 1, true, null, leftName, rightName);
    } else if (missedMatch) {
      const [, actor, target] = missedMatch;

      cue = toShotCue(actor, target, 1, false, 0, leftName, rightName);
    }

    if (!cue) {
      continue;
    }

    const cueKey = `${cue.actor}-${cue.target}-${cue.landed}-${cue.damage ?? "na"}`;

    if (!seenKeys.has(cueKey)) {
      seenKeys.add(cueKey);
      shots.push(cue);
    }
  }

  return shots;
}

function toShotCue(
  actor: string,
  target: string,
  shots: number,
  landed: boolean,
  damage: number | null,
  leftName: string,
  rightName: string
) {
  const actorSide = resolveAgentSide(actor, leftName, rightName);
  const targetSide = resolveAgentSide(target, leftName, rightName);

  if (!actorSide || !targetSide || actorSide === targetSide || shots <= 0) {
    return null;
  }

  return {
    actor: actor.trim(),
    damage,
    landed,
    shots,
    side: actorSide,
    target: target.trim(),
    targetSide,
  } satisfies ShotCue;
}

function resolveAgentSide(
  name: string,
  leftName: string,
  rightName: string
): "left" | "right" | null {
  const normalizedName = normalizeName(name);

  if (!normalizedName) {
    return null;
  }

  if (normalizedName === normalizeName(leftName)) {
    return "left";
  }

  if (normalizedName === normalizeName(rightName)) {
    return "right";
  }

  return null;
}

function parseDecisionActions(message: string) {
  const payload = decodeStructuredMessage(message);
  const rawItems = Array.isArray(payload) ? payload : [payload];

  return rawItems.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const record = item as Record<string, unknown>;
    const targetCandidate =
      typeof record.Target === "string"
        ? record.Target
        : typeof record.target === "string"
          ? record.target
          : "";
    const rawShots =
      record.Shots !== undefined ? record.Shots : record.shots !== undefined ? record.shots : 0;
    const parsedShots =
      typeof rawShots === "number" ? rawShots : Number.parseInt(String(rawShots), 10);

    if (!targetCandidate.trim() || !Number.isFinite(parsedShots) || parsedShots <= 0) {
      return [];
    }

    return [
      {
        shots: Math.max(1, Math.round(parsedShots)),
        target: targetCandidate.trim(),
      } satisfies ParsedShotAction,
    ];
  });
}

function decodeStructuredMessage(message: string): unknown {
  let candidate: unknown = message.trim();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (typeof candidate !== "string") {
      return candidate;
    }

    const normalizedCandidate = candidate.trim();

    if (!normalizedCandidate) {
      return [];
    }

    try {
      candidate = JSON.parse(normalizedCandidate);
    } catch {
      return normalizedCandidate;
    }
  }

  return candidate;
}

function splitEventLines(message: string) {
  return message
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

function toDomId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

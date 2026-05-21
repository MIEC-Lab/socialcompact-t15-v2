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

type AgentTone = "ruby" | "azure";

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
  const leftPerformerKey = `${leftAgent.name}-${activeName === leftAgent.name ? "speak" : "idle"}-${leftIsFiring ? latestVolleyCue?.id ?? "fire" : "calm"}-${leftUnderFire ? latestVolleyCue?.id ?? "hit" : "steady"}`;
  const rightPerformerKey = `${rightAgent.name}-${activeName === rightAgent.name ? "speak" : "idle"}-${rightIsFiring ? latestVolleyCue?.id ?? "fire" : "calm"}-${rightUnderFire ? latestVolleyCue?.id ?? "hit" : "steady"}`;

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

              <div className="relative z-10">
                <div className="relative order-last min-h-72 overflow-hidden rounded-[28px] border border-cyan-200/12 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),rgba(15,23,42,0.9)_42%,rgba(2,6,23,0.98))] px-4 pt-4 shadow-inner shadow-slate-950/30 lg:order-none">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(248,113,113,0.12),transparent_25%),radial-gradient(circle_at_80%_16%,rgba(96,165,250,0.14),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.04),rgba(2,6,23,0.46))]" />
                  <div className="absolute inset-x-6 bottom-20 h-px bg-cyan-100/16" />
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-[linear-gradient(180deg,rgba(15,23,42,0),rgba(2,6,23,0.78))]" />
                  <div className="relative h-[28rem]">
                    <div className="absolute left-4 top-3 z-10 w-[13rem] sm:left-5 sm:w-[14rem]">
                      <SpeechBubble
                        agent={leftAgent}
                        active={activeName === leftAgent.name}
                        compact
                      />
                    </div>
                    <div className="absolute right-4 top-3 z-10 w-[13rem] sm:right-5 sm:w-[14rem]">
                      <SpeechBubble
                        agent={rightAgent}
                        active={activeName === rightAgent.name}
                        compact
                      />
                    </div>
                    <ShotAnimationLayer
                      cue={latestVolleyCue}
                      key={latestVolleyCue?.id ?? "no-volley"}
                    />
                    <div className="absolute bottom-0 left-[11%] flex w-[11rem] justify-center sm:left-[14%]">
                      <DoodleDuelist
                        agent={leftAgent}
                        active={activeName === leftAgent.name}
                        firing={leftIsFiring}
                        key={leftPerformerKey}
                        tone="ruby"
                        underFire={leftUnderFire}
                      />
                    </div>
                    <div className="absolute bottom-0 right-[11%] flex w-[11rem] justify-center sm:right-[14%]">
                      <DoodleDuelist
                        agent={rightAgent}
                        active={activeName === rightAgent.name}
                        firing={rightIsFiring}
                        key={rightPerformerKey}
                        tone="azure"
                        underFire={rightUnderFire}
                      />
                    </div>
                  </div>
                </div>
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

function SpeechBubble({
  agent,
  active,
  compact = false,
}: {
  agent: AgentRole;
  active: boolean;
  compact?: boolean;
}) {
  const latestMessage = agent.latestChat?.message;
  const pointerClassName =
    agent.side === "left"
      ? "left-10 border-r-white"
      : "right-10 border-l-white";

  return (
    <div
      className={`relative rounded-[28px] border-2 shadow-[0_18px_70px_rgba(2,6,23,0.24)] transition ${
        compact ? "min-h-0 p-3.5" : "min-h-48 p-4"
      } ${
        active
          ? "agent-theater-bubble-active border-white/90 bg-white text-slate-900"
          : "border-white/14 bg-slate-950/62"
      }`}
    >
      <div
        className={`absolute -bottom-3 h-0 w-0 border-y-[12px] border-y-transparent ${
          agent.side === "left" ? "border-r-[18px]" : "border-l-[18px]"
        } ${pointerClassName}`}
      />
      <p
        className={`text-xs font-semibold uppercase tracking-[0.22em] ${
          active ? "text-slate-700" : "text-cyan-200"
        }`}
      >
        {agent.name}
      </p>
      <p
        className={`mt-2 overflow-y-auto whitespace-pre-wrap break-words ${
          compact
            ? "max-h-20 min-h-0 text-[0.92rem] leading-5"
            : "max-h-28 min-h-16 text-sm leading-6"
        } ${
          active ? "text-slate-800" : "text-slate-100"
        }`}
      >
        {latestMessage ?? "Listening for the next message..."}
      </p>
      {compact ? null : (
        <div className="mt-3 flex flex-wrap gap-2">
          <MiniBadge label="Chat" active={Boolean(agent.latestChat)} />
          <MiniBadge label="Think" active={Boolean(agent.latestReasoning)} />
          <MiniBadge label="Predict" active={Boolean(agent.latestPrediction)} />
          <MiniBadge label="Act" active={Boolean(agent.latestDecision)} />
        </div>
      )}
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

function DoodleDuelist({
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
  const talking = active && !firing;
  const palette =
    tone === "ruby"
      ? {
          accent: "#ef4444",
          accentSoft: "#fecaca",
          armor: "#334155",
          badge: "#d4a84f",
          cape: "#991b1b",
          capeEdge: "#f59e0b",
          coat: "#8b5a3c",
          coatSoft: "#f87171",
          hair: "#4a2f20",
          pants: "#2f241e",
          pantsEdge: "#6b4c37",
          shirt: "#475569",
          boot: "#1f2937",
          gun: "#111827",
          gunMetal: "#475569",
          hatBand: "#6b4423",
          hatDark: "#5c3a21",
          hatLight: "#8a5b35",
          leather: "#5b3b25",
          outline: "#111827",
          scarf: "#b91c1c",
          skin: "#f6e7d8",
          stubble: "#5b463a",
        }
      : {
          accent: "#3b82f6",
          accentSoft: "#bfdbfe",
          armor: "#334155",
          badge: "#d4a84f",
          cape: "#1d4ed8",
          capeEdge: "#f59e0b",
          coat: "#8b5a3c",
          coatSoft: "#60a5fa",
          hair: "#4a2f20",
          pants: "#2f241e",
          pantsEdge: "#6b4c37",
          shirt: "#475569",
          boot: "#1f2937",
          gun: "#111827",
          gunMetal: "#475569",
          hatBand: "#6b4423",
          hatDark: "#5c3a21",
          hatLight: "#8a5b35",
          leather: "#5b3b25",
          outline: "#111827",
          scarf: "#b91c1c",
          skin: "#f6e7d8",
          stubble: "#5b463a",
        };
  const performerId = toDomId(`${agent.name}-${tone}`);
  const performerClassName = [
    "agent-theater-doodle",
    active ? "agent-theater-speaking" : "",
    firing ? "agent-theater-firing" : "",
    underFire ? "agent-theater-under-fire" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const faceForwardTransform =
    agent.side === "right" ? "translate(184 0) scale(-1 1)" : undefined;

  return (
    <div className="flex min-w-0 flex-col items-center">
      <svg
        aria-label={`${agent.name} doodle duelist`}
        className={`h-[15rem] w-[11.2rem] overflow-visible ${performerClassName}`}
        role="img"
        style={
          {
            "--hit-direction": agent.side === "left" ? "-1" : "1",
            "--kick-direction": agent.side === "left" ? "1" : "-1",
          } as CSSProperties
        }
        viewBox="0 0 184 252"
      >
        <defs>
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
          <linearGradient
            id={`coat-${performerId}`}
            x1="0%"
            x2="100%"
            y1="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={palette.coatSoft} />
            <stop offset="100%" stopColor={palette.coat} />
          </linearGradient>
        </defs>

        <ellipse cx="92" cy="230" fill="rgba(15,23,42,0.34)" rx="38" ry="10" />

        <g transform={faceForwardTransform}>
          <g className={talking ? "agent-theater-poncho-flutter" : ""}>
            <path
              d="M101 90 Q136 97 148 128 Q134 140 114 153 L100 123 Z"
              fill={palette.cape}
              stroke={palette.outline}
              strokeLinejoin="round"
              strokeWidth="4"
            />
            <path
              d="M107 96 Q129 103 139 124"
              fill="none"
              stroke={palette.capeEdge}
              strokeLinecap="round"
              strokeWidth="3"
            />
            <path
              d="M114 112 L130 108"
              fill="none"
              stroke={palette.capeEdge}
              strokeLinecap="round"
              strokeWidth="3"
            />
          </g>

          <path
            d="M72 91 Q91 80 111 91 L114 141 Q92 154 69 141 Z"
            fill={`url(#coat-${performerId})`}
            stroke={palette.outline}
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <path
            d="M77 97 Q92 108 107 97"
            fill={palette.scarf}
            stroke={palette.outline}
            strokeLinejoin="round"
            strokeWidth="3"
          />
          <path
            d="M80 95 Q91 114 103 95"
            fill={palette.shirt}
            stroke={palette.outline}
            strokeLinejoin="round"
            strokeWidth="3"
          />
          <rect
            fill={palette.armor}
            height="17"
            rx="6"
            stroke={palette.outline}
            strokeWidth="3"
            width="26"
            x="79"
            y="106"
          />
          <path
            d="M92 101 L92 139"
            fill="none"
            opacity="0.7"
            stroke={palette.outline}
            strokeLinecap="round"
            strokeWidth="3"
          />
          <rect
            fill={palette.badge}
            height="8"
            rx="2.5"
            stroke={palette.outline}
            strokeWidth="2"
            width="11"
            x="87"
            y="110"
          />
          <path
            d="M76 133 H109"
            fill="none"
            opacity="0.45"
            stroke={palette.leather}
            strokeLinecap="round"
            strokeWidth="3.2"
          />
          <path
            d="M81 139 Q92 144 103 139"
            fill={palette.leather}
            stroke={palette.outline}
            strokeLinejoin="round"
            strokeWidth="3"
          />

          {firing ? (
            <>
              <path
                d="M69 103 Q61 119 66 144 L77 144 Q79 124 83 108 Z"
                fill={palette.coatSoft}
                stroke={palette.outline}
                strokeLinejoin="round"
                strokeWidth="3.4"
              />
              <path
                d="M64 143 Q68 147 74 147 L73 155 Q66 156 61 150 Z"
                fill={palette.skin}
                stroke={palette.outline}
                strokeLinejoin="round"
                strokeWidth="2.6"
              />
              <path
                d="M101 102 Q119 104 132 98 L136 110 Q122 121 102 118 Z"
                fill={palette.coatSoft}
                stroke={palette.outline}
                strokeLinejoin="round"
                strokeWidth="3.4"
              />
              <path
                d="M131 98 Q145 95 157 97 L157 108 Q145 111 132 110 Z"
                fill={palette.skin}
                stroke={palette.outline}
                strokeLinejoin="round"
                strokeWidth="2.6"
              />
            </>
          ) : talking ? (
            <>
              <path
                d="M70 103 Q64 116 70 133 L81 132 Q81 120 83 107 Z"
                fill={palette.coatSoft}
                stroke={palette.outline}
                strokeLinejoin="round"
                strokeWidth="3.4"
              />
              <path
                d="M70 133 Q74 136 80 136 L80 143 Q74 147 68 145 Z"
                fill={palette.skin}
                stroke={palette.outline}
                strokeLinejoin="round"
                strokeWidth="2.6"
              />
              <g className="agent-theater-talk-hand">
                <path
                  d="M101 102 Q113 108 122 99 L128 108 Q121 118 106 120 Z"
                  fill={palette.coatSoft}
                  stroke={palette.outline}
                  strokeLinejoin="round"
                  strokeWidth="3.4"
                />
                <path
                  d="M127 96 Q132 92 138 93 Q141 97 140 102 Q135 106 129 105 Q126 101 127 96 Z"
                  fill={palette.skin}
                  stroke={palette.outline}
                  strokeLinejoin="round"
                  strokeWidth="2.6"
                />
              </g>
            </>
          ) : (
            <>
              <path
                d="M69 103 Q61 118 66 142 L77 142 Q79 123 83 107 Z"
                fill={palette.coatSoft}
                stroke={palette.outline}
                strokeLinejoin="round"
                strokeWidth="3.4"
              />
              <path
                d="M65 141 Q69 144 75 144 L75 151 Q69 154 63 150 Z"
                fill={palette.skin}
                stroke={palette.outline}
                strokeLinejoin="round"
                strokeWidth="2.6"
              />
              <path
                d="M102 103 Q112 118 112 142 L102 142 Q100 123 97 107 Z"
                fill={palette.coatSoft}
                stroke={palette.outline}
                strokeLinejoin="round"
                strokeWidth="3.4"
              />
              <path
                d="M103 142 Q107 144 113 144 L113 151 Q108 154 102 151 Z"
                fill={palette.skin}
                stroke={palette.outline}
                strokeLinejoin="round"
                strokeWidth="2.6"
              />
            </>
          )}

          <path
            d="M77 145 Q83 157 83 175 L72 176 Q70 161 72 147 Z"
            fill={palette.pants}
            stroke={palette.outline}
            strokeLinejoin="round"
            strokeWidth="3.4"
          />
          <path
            d="M96 145 Q106 157 109 175 L98 176 Q94 160 90 147 Z"
            fill={palette.pants}
            stroke={palette.outline}
            strokeLinejoin="round"
            strokeWidth="3.4"
          />
          <path
            d="M73 173 Q75 191 73 213 L84 213 Q86 194 84 175 Z"
            fill={palette.pantsEdge}
            stroke={palette.outline}
            strokeLinejoin="round"
            strokeWidth="3.2"
          />
          <path
            d="M98 173 Q102 191 106 213 L117 213 Q114 194 109 175 Z"
            fill={palette.pantsEdge}
            stroke={palette.outline}
            strokeLinejoin="round"
            strokeWidth="3.2"
          />
          <path
            d="M68 212 Q77 210 86 213 L87 221 Q77 224 64 222 Z"
            fill={palette.boot}
            stroke={palette.outline}
            strokeLinejoin="round"
            strokeWidth="3"
          />
          <path
            d="M101 212 Q112 210 121 214 L121 222 Q111 224 98 222 Z"
            fill={palette.boot}
            stroke={palette.outline}
            strokeLinejoin="round"
            strokeWidth="3"
          />

          <path
            d="M55 47 Q92 27 130 47 Q92 58 55 47 Z"
            fill={`url(#hat-${performerId})`}
            stroke={palette.outline}
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <path
            d="M68 17 Q89 5 112 12 Q124 19 124 35 L124 49 H67 Z"
            fill={`url(#hat-${performerId})`}
            stroke={palette.outline}
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <path
            d="M67 49 H123"
            fill="none"
            opacity="0.35"
            stroke="#f8fafc"
            strokeLinecap="round"
            strokeWidth="2.2"
          />
          <rect
            fill={palette.hatBand}
            height="9"
            rx="3.5"
            stroke={palette.outline}
            strokeWidth="2.4"
            width="54"
            x="68"
            y="38"
          />
          <path
            d="M88 36 L92 47 M100 36 L105 47 M112 36 L117 47"
            fill="none"
            opacity="0.75"
            stroke={palette.badge}
            strokeLinecap="round"
            strokeWidth="2.4"
          />
          <path
            d="M94 22 L101 25 L103 32 L97 37 L90 34 L88 27 Z"
            fill={palette.badge}
            stroke={palette.outline}
            strokeLinejoin="round"
            strokeWidth="2.3"
          />

          <path
            d="M69 49 Q63 66 68 80 Q89 93 114 82 Q120 64 112 49 Z"
            fill={palette.skin}
            stroke={palette.outline}
            strokeLinejoin="round"
            strokeWidth="4.6"
          />
          <path
            d="M71 51 Q89 58 112 50 Q106 82 92 85 Q77 82 71 51 Z"
            fill={palette.skin}
            opacity="0.5"
          />
          <path
            d="M72 46 Q79 37 92 36 Q104 34 115 39 Q106 56 92 61 Q79 60 72 46 Z"
            fill={palette.hair}
            stroke={palette.outline}
            strokeLinejoin="round"
            strokeWidth="3.4"
          />
          <path
            d="M73 46 Q67 55 69 66 Q79 61 83 49"
            fill={palette.hair}
            stroke={palette.outline}
            strokeLinejoin="round"
            strokeWidth="3.2"
          />
          <path
            d="M107 45 Q115 53 117 62 Q108 59 102 49"
            fill={palette.hair}
            stroke={palette.outline}
            strokeLinejoin="round"
            strokeWidth="3.2"
          />
          <path
            d="M81 47 Q90 42 99 43 Q91 52 80 53"
            fill={palette.hair}
            stroke={palette.outline}
            strokeLinejoin="round"
            strokeWidth="2.8"
          />

          <path
            d={
              firing
                ? "M77 61 Q82 52 89 58"
                : talking
                  ? "M76 57 Q81 53 87 57"
                  : "M77 58 Q82 55 88 58"
            }
            fill="none"
            stroke={palette.outline}
            strokeLinecap="round"
            strokeWidth="3.1"
          />
          <path
            d={
              firing
                ? "M98 58 Q104 50 110 54"
                : talking
                  ? "M98 57 Q103 53 109 56"
                  : "M98 58 Q104 55 110 57"
            }
            fill="none"
            stroke={palette.outline}
            strokeLinecap="round"
            strokeWidth="3.1"
          />
          {firing ? (
            <>
              <path
                d="M79 67 Q83 66 87 68"
                fill="none"
                stroke={palette.outline}
                strokeLinecap="round"
                strokeWidth="2.8"
              />
              <path
                d="M98 68 Q104 63 109 65"
                fill="none"
                stroke={palette.outline}
                strokeLinecap="round"
                strokeWidth="2.8"
              />
            </>
          ) : (
            <>
              <ellipse cx="81.5" cy="66" fill={palette.outline} rx="3.8" ry="4.5" />
              <ellipse cx="103" cy="66" fill={palette.outline} rx="3.8" ry="4.5" />
            </>
          )}
          <path
            d="M89 66 Q92 69 95 66"
            fill="none"
            stroke={palette.stubble}
            strokeLinecap="round"
            strokeWidth="2"
          />
          <path
            d="M80 79 Q92 85 105 79"
            fill="none"
            opacity="0.7"
            stroke={palette.stubble}
            strokeLinecap="round"
            strokeWidth="5"
          />
          <path
            d="M91 78 L95 88"
            fill="none"
            opacity="0.7"
            stroke={palette.stubble}
            strokeLinecap="round"
            strokeWidth="4.4"
          />
          <path
            d="M85 86 Q92 91 99 86"
            fill="none"
            opacity="0.72"
            stroke={palette.stubble}
            strokeLinecap="round"
            strokeWidth="4.2"
          />

          {talking ? (
            <ellipse
              className="agent-theater-mouth-shape agent-theater-mouth-pulse-active"
              cx="92"
              cy="75"
              fill={palette.outline}
              rx="6.2"
              ry="5.6"
            />
          ) : firing ? (
            <path
              d="M83 77 Q92 72 101 76"
              fill="none"
              stroke={palette.outline}
              strokeLinecap="round"
              strokeWidth="3.8"
            />
          ) : (
            <path
              d="M84 76 Q93 81 101 75"
              fill="none"
              stroke={palette.outline}
              strokeLinecap="round"
              strokeWidth="3.2"
            />
          )}
          <circle cx="75" cy="71" fill={palette.accentSoft} opacity="0.46" r="2.7" />
          <circle cx="110" cy="71" fill={palette.accentSoft} opacity="0.46" r="2.7" />

          {firing ? (
            <g
              className="agent-theater-pistol-slide"
              transform="translate(145 95)"
            >
              <rect
                fill={palette.gun}
                height="8"
                rx="2"
                stroke={palette.outline}
                strokeWidth="2"
                width="31"
                x="0"
                y="-5"
              />
              <rect
                fill={palette.gunMetal}
                height="4.5"
                rx="1.5"
                width="11"
                x="19"
                y="-3.5"
              />
              <path
                d="M12 4 H20 L17 19 L8 16 Z"
                fill={palette.gun}
                stroke={palette.outline}
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d="M13 5 Q10 8 9 12"
                fill="none"
                stroke={palette.outline}
                strokeLinecap="round"
                strokeWidth="2"
              />
              <circle cx="30" cy="-1.2" fill="#cbd5e1" r="1.4" />
            </g>
          ) : null}
        </g>
      </svg>
      <p className="mt-3 max-w-36 truncate rounded-full border border-white/12 bg-slate-950/72 px-4 py-2 text-sm font-bold text-white shadow-[0_14px_30px_rgba(2,6,23,0.26)]">
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
  const shotY = 266 + (index - (total - 1) / 2) * 13;
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

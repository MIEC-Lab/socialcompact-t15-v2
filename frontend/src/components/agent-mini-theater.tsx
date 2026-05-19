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

const AGENT_PHASES = ["chat", "reasoning", "prediction", "decision"] as const;

export function AgentMiniTheater({
  result,
  processEvents,
}: AgentMiniTheaterProps) {
  const agentEvents = processEvents.filter((event) =>
    AGENT_PHASES.includes(event.phase as (typeof AGENT_PHASES)[number])
  );
  const playerNames = getTheaterNames(result, processEvents);
  const leftAgent = buildAgentRole(playerNames[0], "left", processEvents);
  const rightAgent = buildAgentRole(playerNames[1], "right", processEvents);
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
                <div className="absolute left-1/2 top-8 h-44 w-[70%] -translate-x-1/2 rounded-full bg-cyan-200/8 blur-3xl" />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-[linear-gradient(180deg,rgba(8,47,73,0.12),rgba(15,23,42,0.86))]" />
                <div className="absolute inset-x-8 bottom-16 h-px bg-white/14" />
                <div className="relative flex h-64 items-end justify-between gap-3">
                  <StickAgent
                    agent={leftAgent}
                    active={activeName === leftAgent.name}
                    tone="cyan"
                  />
                  <div className="absolute left-1/2 top-5 -translate-x-1/2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                    Arena Stage
                  </div>
                  <StickAgent
                    agent={rightAgent}
                    active={activeName === rightAgent.name}
                    tone="emerald"
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

function StickAgent({
  agent,
  active,
  tone,
}: {
  agent: AgentRole;
  active: boolean;
  tone: "cyan" | "emerald";
}) {
  const toneClassName =
    tone === "cyan"
      ? "text-cyan-100"
      : "text-emerald-100";
  const haloClassName =
    tone === "cyan"
      ? "fill-cyan-300/12 stroke-cyan-200/45"
      : "fill-emerald-300/12 stroke-emerald-200/45";
  const activeMouthPath =
    "M44 53 C52 50 68 50 76 53 C81 56 81 64 76 67 C68 70 52 70 44 67 C39 64 39 56 44 53 Z";
  const eyePositions =
    agent.side === "left"
      ? [
          { cx: 53, cy: 38 },
          { cx: 75, cy: 38 },
        ]
      : [
          { cx: 45, cy: 38 },
          { cx: 67, cy: 38 },
        ];

  return (
    <div className="flex min-w-24 flex-col items-center">
      <svg
        aria-label={`${agent.name} stick figure`}
        className={`agent-theater-bob h-44 w-28 overflow-visible ${toneClassName} ${
          active ? "agent-theater-speaking" : ""
        }`}
        role="img"
        viewBox="0 0 120 180"
      >
        <ellipse
          className={active ? "fill-cyan-300/12" : "fill-white/5"}
          cx="60"
          cy="77"
          rx="52"
          ry="70"
        />
        <g
          className="agent-theater-stick-bones"
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        >
          <path d="M60 67 L60 118" />
          <path d="M60 84 L26 71" />
          <path d="M60 84 L94 71" />
          <path d="M60 118 L34 158" />
          <path d="M60 118 L86 158" />
        </g>
        <circle
          className={haloClassName}
          cx="60"
          cy="39"
          r="29"
          strokeWidth="4"
        />
        {eyePositions.map((eye) => (
          <circle
            cx={eye.cx}
            cy={eye.cy}
            fill="rgba(255,255,255,0.92)"
            key={`${eye.cx}-${eye.cy}`}
            r="4.8"
          />
        ))}
        {active ? (
          <path
            className="agent-theater-mouth-shape agent-theater-mouth-pulse-active"
            d={activeMouthPath}
            fill="rgba(255,255,255,0.86)"
          />
        ) : (
          <path
            d="M48 56 L72 56"
            fill="none"
            stroke="rgba(255,255,255,0.82)"
            strokeLinecap="round"
            strokeWidth="6"
          />
        )}
      </svg>
      <p className="mt-2 max-w-32 truncate rounded-full border border-white/10 bg-slate-950/65 px-4 py-2 text-sm font-bold text-white">
        {agent.name}
      </p>
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

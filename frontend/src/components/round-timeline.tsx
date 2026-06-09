"use client";

/*
 * Authorship: Chenle Chen (D) owns round timeline visualization.
 * Scope: Shows per-round progression and key events.
 */

import { useState } from "react";
import type { RoundDetailData, RoundEvent, RoundEventType } from "./round-detail";

const demoRounds: RoundDetailData[] = [
  {
    id: 1,
    events: [
      {
        text: "Alice and Bob coordinate before voting.",
        type: "event",
      },
      {
        text: "Charlie receives two votes.",
        type: "vote",
      },
      {
        text: "Charlie is eliminated.",
        type: "elimination",
      },
    ],
    remainingPlayers: ["Alice", "Bob", "Dana"],
    chats: [
      {
        speaker: "Alice",
        message: "I think we should keep the alliance stable this round.",
      },
      {
        speaker: "Bob",
        message: "Charlie is quiet. That may mean he is planning a vote.",
      },
    ],
    predictions: [
      {
        player: "Alice",
        prediction: "Bob will vote with the majority alliance.",
      },
      {
        player: "Charlie",
        prediction: "Alice may try to protect Bob.",
      },
    ],
    actions: [
      {
        player: "Alice",
        action: "Votes for Charlie.",
      },
      {
        player: "Bob",
        action: "Votes for Charlie.",
      },
    ],
    observations: [
      {
        label: "Vote Result",
        value: "Charlie receives two votes and becomes at risk.",
      },
      {
        label: "Social Signal",
        value: "Alice and Bob show early coordination.",
      },
    ],
  },
  {
    id: 2,
    events: [
      {
        text: "Bob and Dana discuss whether to split votes.",
        type: "event",
      },
      {
        text: "The majority alliance stays together.",
        type: "status",
      },
    ],
    remainingPlayers: ["Alice", "Bob", "Dana"],
    chats: [
      {
        speaker: "Bob",
        message: "We need to decide whether to split votes or stay together.",
      },
      {
        speaker: "Dana",
        message: "A split vote is risky unless everyone confirms.",
      },
    ],
    predictions: [
      {
        player: "Bob",
        prediction: "Dana will choose the safer majority action.",
      },
      {
        player: "Dana",
        prediction: "Bob is likely to avoid a surprising move.",
      },
    ],
    actions: [
      {
        player: "Bob",
        action: "Keeps vote aligned with Dana.",
      },
      {
        player: "Dana",
        action: "Targets the least trusted player.",
      },
    ],
    observations: [
      {
        label: "Trust",
        value: "Bob and Dana increase mutual trust after matching actions.",
      },
    ],
  },
  {
    id: 3,
    events: [
      {
        text: "Alice builds a final coalition.",
        type: "event",
      },
      {
        text: "The final vote removes the strongest opponent.",
        type: "elimination",
      },
    ],
    remainingPlayers: ["Alice"],
    chats: [
      {
        speaker: "Alice",
        message: "This is the last chance to remove the strongest player.",
      },
      {
        speaker: "Dana",
        message: "I agree, but only if the vote is unanimous.",
      },
    ],
    predictions: [
      {
        player: "Alice",
        prediction: "Dana will cooperate if the plan is explicit.",
      },
      {
        player: "Bob",
        prediction: "Alice may lead a final-round coalition.",
      },
    ],
    actions: [
      {
        player: "Alice",
        action: "Builds a final coalition.",
      },
      {
        player: "Dana",
        action: "Joins Alice's vote plan.",
      },
    ],
    observations: [
      {
        label: "Outcome",
        value: "The final coalition succeeds.",
      },
      {
        label: "Pattern",
        value: "Players use explicit commitments before acting.",
      },
    ],
  },
];

type RoundTimelineProps = {
  rounds?: RoundDetailData[];
};

function eventTone(type: RoundEventType) {
  if (type === "elimination") {
    return {
      label: "Elimination",
      className: "border-rose-300/35 bg-rose-300/15 text-rose-100",
      dotClassName: "bg-rose-300",
    };
  }
  if (type === "vote") {
    return {
      label: "Vote",
      className: "border-amber-300/30 bg-amber-300/10 text-amber-100",
      dotClassName: "bg-amber-300",
    };
  }
  if (type === "status") {
    return {
      label: "Status",
      className: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
      dotClassName: "bg-emerald-300",
    };
  }
  return {
    label: "Event",
    className: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
    dotClassName: "bg-cyan-300",
  };
}

function playerColorClass(index: number) {
  const colors = [
    "border-cyan-300/30 bg-cyan-300/15 text-cyan-100",
    "border-emerald-300/30 bg-emerald-300/15 text-emerald-100",
    "border-violet-300/30 bg-violet-300/15 text-violet-100",
    "border-amber-300/30 bg-amber-300/15 text-amber-100",
    "border-rose-300/30 bg-rose-300/15 text-rose-100",
  ];

  return colors[index % colors.length];
}

function getPlayerInitial(player: string) {
  return player.trim().slice(0, 1).toUpperCase() || "?";
}

function getKeyEvent(events: RoundEvent[]) {
  return (
    events.find((event) => event.type === "elimination") ??
    events.find((event) => event.type === "vote") ??
    events.find((event) => event.type === "status") ??
    events[0]
  );
}

export function RoundTimeline({ rounds }: RoundTimelineProps) {
  const visibleRounds = rounds ?? demoRounds;
  const [openRoundIds, setOpenRoundIds] = useState<number[]>(
    visibleRounds.map((round) => round.id)
  );

  function toggleRound(roundId: number) {
    setOpenRoundIds((currentIds) =>
      currentIds.includes(roundId)
        ? currentIds.filter((id) => id !== roundId)
        : [...currentIds, roundId]
    );
  }

  if (visibleRounds.length === 0) {
    return (
      <section className="rounded-[32px] border border-white/10 bg-white/6 p-6 backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
          Round Timeline
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">
          No Round Logs Yet
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          This match result does not include round logs, so there are no events
          or remaining players to visualize yet.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/6 p-6 backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Round Timeline
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Round Logs
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          {visibleRounds.length} round{visibleRounds.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {visibleRounds.map((round) => {
          const remainingPlayers = round.remainingPlayers ?? [];
          const events = round.events ?? [];
          const keyEvent = getKeyEvent(events);
          const isOpen = openRoundIds.includes(round.id);

          return (
            <div key={round.id} className="relative pl-8">
              <div className="absolute left-3 top-0 h-full w-px bg-cyan-300/20" />
              <div className="absolute left-0 top-7 flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300/40 bg-slate-950 text-xs font-bold text-cyan-100">
                {round.id}
              </div>

              <article className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                      Round {round.id}
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-white">
                      Events
                    </h3>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl border border-emerald-300/25 bg-emerald-300/10 px-4 py-3 text-right">
                      <p className="text-2xl font-bold text-emerald-100">
                        {remainingPlayers.length}
                      </p>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/80">
                        Remaining
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleRound(round.id)}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100"
                    >
                      {isOpen ? "Collapse" : "Expand"}
                    </button>
                  </div>
                </div>

                {keyEvent ? (
                  <div className="mt-4 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                      Key Event
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-100">
                      {keyEvent.text}
                    </p>
                  </div>
                ) : null}

                {isOpen ? (
                  <>
                    {events.length === 0 ? (
                      <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
                        No events recorded for this round.
                      </p>
                    ) : (
                      <ol className="mt-4 space-y-3">
                        {events.map((event, index) => {
                          const tone = eventTone(event.type);

                          return (
                            <li
                              key={`${round.id}-${index}-${event.text}`}
                              className={`rounded-2xl border px-4 py-3 ${tone.className}`}
                            >
                              <div className="flex items-start gap-3">
                                <span
                                  className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${tone.dotClassName}`}
                                />
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
                                    {tone.label}
                                  </p>
                                  <p className="mt-1 text-sm leading-6">
                                    {event.text}
                                  </p>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    )}

                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Remaining Players
                      </p>
                      {remainingPlayers.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {remainingPlayers.map((player, index) => (
                            <span
                              key={`${round.id}-${player}`}
                              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/35 py-1 pl-1 pr-3 text-sm text-slate-200"
                            >
                              <span
                                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${playerColorClass(
                                  index
                                )}`}
                              >
                                {getPlayerInitial(player)}
                              </span>
                              {player}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          No remaining players recorded.
                        </p>
                      )}
                    </div>
                  </>
                ) : null}
              </article>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export { demoRounds };

export default RoundTimeline;

/*
 * Authorship: Chonglin Dong (C) owns summary highlight cards for the results page.
 * Scope: Condenses key result metrics into presentation-ready highlights.
 */

import type { MatchResult } from "@/lib/types";
import type { ResultPresentation } from "./result-summary-model";

type ResultSummaryHighlightsProps = {
  result: MatchResult;
  stats: ResultPresentation["stats"];
};

// Author: Chonglin Dong (C) - summary highlight cards for the results page.
export function ResultSummaryHighlights({
  result,
  stats,
}: ResultSummaryHighlightsProps) {
  const cards = [
    {
      label: "Players",
      value: String(stats.playerCount),
      detail: "Combatants on the board",
      className:
        "border-cyan-300/14 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.72))]",
    },
    {
      label: "Rounds",
      value: String(result.rounds),
      detail: "Resolved before final verdict",
      className:
        "border-amber-300/14 bg-[linear-gradient(135deg,rgba(251,191,36,0.16),rgba(15,23,42,0.72))]",
    },
    {
      label: "Eliminated",
      value: String(stats.eliminatedPlayers),
      detail: `${stats.activePlayers} still standing`,
      className:
        "border-rose-300/14 bg-[linear-gradient(135deg,rgba(251,113,133,0.16),rgba(15,23,42,0.72))]",
    },
    {
      label: "Events",
      value: String(stats.totalEvents),
      detail: "Timeline actions logged",
      className:
        "border-fuchsia-300/14 bg-[linear-gradient(135deg,rgba(217,70,239,0.16),rgba(15,23,42,0.72))]",
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className={`rounded-[30px] border p-5 shadow-[0_18px_60px_rgba(2,6,23,0.24)] ${card.className}`}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-white/70">
            {card.label}
          </p>
          <p className="mt-4 text-4xl font-black text-white">{card.value}</p>
          <p className="mt-3 text-sm leading-7 text-slate-200/80">{card.detail}</p>
        </article>
      ))}
    </section>
  );
}

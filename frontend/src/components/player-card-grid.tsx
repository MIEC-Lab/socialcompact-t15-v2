import { PlayerCard } from "./player-card";
import type { PlayerCombatSnapshot } from "./result-summary-model";

type PlayerCardGridProps = {
  players: PlayerCombatSnapshot[];
  winnerByArenaVerdict?: boolean;
};

export function PlayerCardGrid({
  players,
  winnerByArenaVerdict = false,
}: PlayerCardGridProps) {
  return (
    <section
      id="player-status"
      className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.94),rgba(17,24,39,0.78)_42%,rgba(8,47,73,0.88))] p-6 shadow-[0_22px_90px_rgba(8,145,178,0.12)] sm:p-8"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(250,204,21,0.12),transparent_22%)]" />

      <div className="relative">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Player State Cards
            </p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Combatant Readouts
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              {winnerByArenaVerdict
                ? "The winner card is ranked first because Arena returned it as the final verdict. HP, ammo, and elimination flags are reconstructed from public match artifacts when numeric scoring is limited."
                : "HP, ammo reserve, and elimination flags are reconstructed from the current result payload so this page stays presentation-ready even when the backend only sends scores and status text."}
            </p>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-white/6 px-5 py-4 text-sm leading-7 text-slate-200">
            <p className="font-semibold uppercase tracking-[0.22em] text-white/70">
              Matrix
            </p>
            <p className="mt-1 text-2xl font-black text-white">{players.length}</p>
            <p>cards active on the page</p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {players.map((player) => (
            <PlayerCard key={player.name} player={player} />
          ))}
        </div>
      </div>
    </section>
  );
}

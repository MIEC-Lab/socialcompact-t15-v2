/*
 * Authorship: Chonglin Dong (C) owns per-player result card presentation.
 * Scope: Displays player state, score, and summary details.
 */

import type { PlayerCombatSnapshot } from "./result-summary-model";

type PlayerCardProps = {
  player: PlayerCombatSnapshot;
};

const toneMap = {
  winner: {
    card: "border-amber-300/20 bg-[linear-gradient(155deg,rgba(120,53,15,0.22),rgba(15,23,42,0.9)_45%,rgba(120,53,15,0.3))] shadow-[0_20px_90px_rgba(251,191,36,0.16)]",
    badge: "border-amber-200/20 bg-amber-200/10 text-amber-100",
    meter: "from-amber-300 via-yellow-300 to-orange-400",
    accent: "text-amber-200",
  },
  active: {
    card: "border-emerald-300/16 bg-[linear-gradient(155deg,rgba(16,185,129,0.18),rgba(15,23,42,0.9)_45%,rgba(14,116,144,0.24))] shadow-[0_20px_90px_rgba(16,185,129,0.12)]",
    badge: "border-emerald-200/20 bg-emerald-200/10 text-emerald-100",
    meter: "from-emerald-300 via-cyan-300 to-sky-400",
    accent: "text-emerald-200",
  },
  eliminated: {
    card: "border-rose-300/16 bg-[linear-gradient(155deg,rgba(244,63,94,0.18),rgba(15,23,42,0.9)_45%,rgba(91,33,182,0.18))] shadow-[0_20px_90px_rgba(244,63,94,0.12)]",
    badge: "border-rose-200/20 bg-rose-200/10 text-rose-100",
    meter: "from-rose-300 via-pink-300 to-orange-300",
    accent: "text-rose-200",
  },
  neutral: {
    card: "border-slate-200/12 bg-[linear-gradient(155deg,rgba(148,163,184,0.14),rgba(15,23,42,0.9)_45%,rgba(30,41,59,0.28))] shadow-[0_20px_90px_rgba(148,163,184,0.08)]",
    badge: "border-slate-200/18 bg-slate-200/10 text-slate-100",
    meter: "from-slate-300 via-slate-200 to-cyan-200",
    accent: "text-slate-200",
  },
} as const;

export function PlayerCard({ player }: PlayerCardProps) {
  const tone = toneMap[player.tone];

  return (
    <article
      className={`relative overflow-hidden rounded-[32px] border p-5 backdrop-blur sm:p-6 ${tone.card}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_36%)]" />
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-white/8 blur-2xl" />

      {player.eliminated ? (
        <div className="pointer-events-none absolute right-5 top-14 rotate-12 rounded-full border border-rose-200/20 bg-rose-300/10 px-7 py-2 text-[0.68rem] font-bold uppercase tracking-[0.28em] text-rose-100/80 sm:right-7">
          Out
        </div>
      ) : null}

      <div className="relative">
        <div className="flex flex-wrap items-center gap-3 pr-12">
          <span className="whitespace-nowrap rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200">
            Rank {String(player.rank).padStart(2, "0")}
          </span>
          <span
            className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${tone.badge}`}
          >
            {player.statusLabel}
          </span>
        </div>

        <h3 className="mt-4 text-2xl font-black text-white sm:text-3xl">
          {player.name}
        </h3>
        <p className="mt-3 max-w-sm text-sm leading-7 text-slate-200/82">
          {player.insight}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
              Score
            </p>
            <p className={`mt-2 text-5xl font-black tracking-tight ${tone.accent}`}>
              {String(player.score).padStart(2, "0")}
            </p>
          </div>

          <div className="text-sm leading-7 text-slate-200/78 sm:text-right">
            <p>Damage dealt: {player.damageDealt}</p>
            <p>Damage taken: {player.damageTaken}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <Meter
            label="Life"
            value={player.hp}
            maxValue={player.maxHp}
            fillClassName={tone.meter}
          />
          <Meter
            label="Ammo"
            value={player.ammo}
            maxValue={player.maxAmmo}
            fillClassName={tone.meter}
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 2xl:grid-cols-4">
          <StatTile label="Life" value={`${player.hp}/${player.maxHp}`} />
          <StatTile label="Ammo" value={`${player.ammo}/${player.maxAmmo}`} />
          <StatTile label="Shots" value={String(player.shotsFired)} />
          <StatTile label="Eliminated" value={player.eliminated ? "YES" : "NO"} />
        </div>
      </div>
    </article>
  );
}

function Meter({
  label,
  value,
  maxValue,
  fillClassName,
}: {
  label: string;
  value: number;
  maxValue: number;
  fillClassName: string;
}) {
  const width = `${Math.max((value / Math.max(maxValue, 1)) * 100, value > 0 ? 8 : 0)}%`;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <p className="font-semibold uppercase tracking-[0.2em] text-slate-200">
          {label}
        </p>
        <p className="font-mono text-slate-100/85">
          {value}/{maxValue}
        </p>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/30">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${fillClassName}`}
          style={{ width }}
        />
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
      <p className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-300 sm:text-xs">
        {label}
      </p>
      <p className="mt-2 text-xl font-black text-white">{value}</p>
    </div>
  );
}

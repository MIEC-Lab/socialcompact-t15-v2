import Link from "next/link";
import type { MatchResult } from "@/lib/types";
import type { PlayerCombatSnapshot } from "./result-summary-model";

type ResultSummaryHeroProps = {
  result: MatchResult;
  winner: PlayerCombatSnapshot;
  activePlayers: number;
  eliminatedPlayers: number;
  winnerByArenaVerdict: boolean;
  hasEliminations: boolean;
};

export function ResultSummaryHero({
  result,
  winner,
  activePlayers,
  eliminatedPlayers,
  winnerByArenaVerdict,
  hasEliminations,
}: ResultSummaryHeroProps) {
  const running = result.status === "running";
  const isLocalFallback = result.source === "local-fallback";
  const scoreLabel = winnerByArenaVerdict ? "Arena Verdict" : "Winner Score";
  const scoreValue = winnerByArenaVerdict ? "WIN" : String(winner.score);
  const scoreDetail = winnerByArenaVerdict
    ? "Winner selected by Arena"
    : "Highest final tally";
  const headline = winnerByArenaVerdict
    ? `${winner.name} wins by Arena final verdict.`
    : `${winner.name} wins the board and owns the spotlight.`;

  return (
    <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(17,24,39,0.78)_48%,rgba(8,47,73,0.92))] p-6 shadow-[0_25px_120px_rgba(8,145,178,0.16)] sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.2),transparent_32%),radial-gradient(circle_at_78%_20%,rgba(251,191,36,0.16),transparent_22%),linear-gradient(120deg,transparent_35%,rgba(255,255,255,0.03)_50%,transparent_62%)]" />
      <div className="absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(180deg,rgba(248,250,252,0.08),transparent)] blur-3xl" />

      <div className="relative grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-center">
        <div>
          <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/90">
            <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2">
              Final Verdict
            </span>
            <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-slate-200">
              Match {result.match_id}
            </span>
            <span
              className={`rounded-full border px-4 py-2 ${
                result.source === "arena"
                  ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                  : result.source === "demo-snapshot"
                    ? "border-fuchsia-300/25 bg-fuchsia-300/10 text-fuchsia-100"
                    : result.source === "local-fallback"
                      ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
                      : "border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
              }`}
            >
              {result.source}
            </span>
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            {headline}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200/85 sm:text-lg">
            {result.summary}
          </p>

          {winnerByArenaVerdict ? (
            <div className="mt-4 max-w-3xl rounded-2xl border border-amber-200/20 bg-amber-200/10 px-4 py-3 text-sm font-medium leading-7 text-amber-50">
              Arena returned a final winner, but this public run did not expose
              numeric scores. Treat the winner as the Arena&apos;s final verdict,
              not as a highest-score calculation.
              {!hasEliminations
                ? " No elimination was recorded, so the match likely ended by the configured round limit."
                : ""}
            </div>
          ) : null}

          {isLocalFallback ? (
            <div className="mt-4 max-w-3xl rounded-2xl border border-amber-200/20 bg-amber-200/10 px-4 py-3 text-sm font-medium leading-7 text-amber-50">
              This is a safety fallback result, not a real Arena run. Render
              free services may be waking up; wait briefly, confirm the Arena
              and Agent URLs open, then start another match for a real run.
            </div>
          ) : null}

          {running ? (
            <p className="mt-4 max-w-2xl rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-medium leading-7 text-cyan-100">
              Arena artifacts are still syncing. The page refreshes every 3 seconds
              so the overview and player cards stay current.
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/start"
              className="rounded-full bg-[linear-gradient(135deg,#fbbf24,#f97316)] px-6 py-3 text-center text-sm font-bold text-slate-950 transition hover:brightness-110"
            >
              Start Another Match
            </Link>
            <a
              href="#player-status"
              className="rounded-full border border-white/12 bg-white/6 px-6 py-3 text-center text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-white/10"
            >
              Inspect Player Cards
            </a>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <HeroMetric
              label={scoreLabel}
              value={scoreValue}
              detail={scoreDetail}
            />
            <HeroMetric
              label="Players Left"
              value={String(activePlayers)}
              detail={`${eliminatedPlayers} eliminated`}
            />
            <HeroMetric
              label="Round State"
              value={running ? "LIVE" : "FINAL"}
              detail={`${result.rounds} rounds resolved`}
            />
          </div>
        </div>

        <aside className="relative overflow-hidden rounded-[34px] border border-white/10 bg-slate-950/55 p-5 backdrop-blur sm:p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.14),transparent_55%)]" />
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-200/90">
              Champion Signal
            </p>

            <div className="mt-5 rounded-[30px] border border-amber-200/16 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.28),rgba(15,23,42,0.88)_55%,rgba(2,6,23,0.98))] p-6 shadow-[0_18px_80px_rgba(251,191,36,0.18)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-100/80">
                    Rank 01
                  </p>
                  <p className="mt-3 text-3xl font-black text-white sm:text-4xl">
                    {winner.name}
                  </p>
                </div>
                <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-100">
                  {winner.statusLabel}
                </span>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <SignalStat
                  label={winnerByArenaVerdict ? "Verdict" : "Score"}
                  value={scoreValue}
                />
                <SignalStat
                  label="Eliminated"
                  value={winner.eliminated ? "YES" : "NO"}
                />
                <SignalStat
                  label="Life"
                  value={`${winner.hp}/${winner.maxHp}`}
                />
                <SignalStat
                  label="Ammo"
                  value={`${winner.ammo}/${winner.maxAmmo}`}
                />
              </div>

              <div className="mt-6 space-y-4">
                <SignalMeter
                  label="Vitality"
                  value={winner.hp}
                  maxValue={winner.maxHp}
                  fillClassName="from-amber-300 via-yellow-300 to-orange-400"
                />
                <SignalMeter
                  label="Ammo Reserve"
                  value={winner.ammo}
                  maxValue={winner.maxAmmo}
                  fillClassName="from-cyan-300 via-sky-300 to-blue-400"
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function HeroMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/6 p-4 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{detail}</p>
    </div>
  );
}

function SignalStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/18 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/75">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function SignalMeter({
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
  const width = `${Math.max((value / Math.max(maxValue, 1)) * 100, 4)}%`;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <p className="font-semibold uppercase tracking-[0.2em] text-slate-200">
          {label}
        </p>
        <p className="font-mono text-amber-100/90">
          {value}/{maxValue}
        </p>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${fillClassName}`}
          style={{ width }}
        />
      </div>
    </div>
  );
}

/*
 * Authorship: Bowen Dong (A) owns the homepage experience and top-level project framing.
 * Scope: Public landing page for the SocialCOMPACT V2 demo.
 */

import Link from "next/link";

// Author: Bowen Dong (A) - homepage component for the public V2 demo.
export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a_45%,_#111827)] text-white">
      <section className="mx-auto max-w-6xl px-6 py-8 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              CS183 Web Deployment Project
            </p>
            <p className="mt-1 text-sm text-slate-300">
              SocialCOMPACT Survivor visualization demo
            </p>
          </div>
          <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-200">
            Backend Flow Ready
          </div>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.35fr_0.9fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">
              SocialCOMPACT
            </p>

            <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Survivor Game Web Demo for Multi-Agent Social Intelligence
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              This website turns the SocialCOMPACT Survivor simulation into a
              visual, browser-based experience. Users can start a match through
              the backend, inspect round-by-round behavior, and review final
              results through an interactive interface.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/start"
                className="rounded-full bg-cyan-400 px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Start Match
              </Link>

              <Link
                href="/results"
                className="rounded-full border border-slate-500 bg-white/5 px-6 py-3 text-center text-sm font-semibold text-white transition hover:border-cyan-300 hover:bg-white/10"
              >
                View Results
              </Link>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Communicate
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Agents exchange messages before making decisions, allowing
                  alliances, persuasion, and strategic discussion.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Predict
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Each agent predicts what others may do next, which reveals
                  social understanding and expectation modeling.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Act
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Final actions are executed in the Survivor game, and the web
                  page visualizes the process and outcome.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/7 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur">
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-cyan-300">
                Current Weekly Focus
              </p>
              <h2 className="mt-4 text-2xl font-bold text-white">
                What This Demo Must Show
              </h2>

              <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  A clean homepage that explains the project clearly.
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  A start page that calls FastAPI and a results page that reads
                  saved match data.
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  Vercel deployment for the frontend and a clear system
                  architecture presentation.
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-5">
                <p className="text-3xl font-bold text-white">3</p>
                <p className="mt-2 text-sm text-cyan-100">
                  Main pages in the first version
                </p>
              </div>

              <div className="rounded-2xl border border-violet-400/15 bg-violet-400/10 p-5">
                <p className="text-3xl font-bold text-white">6</p>
                <p className="mt-2 text-sm text-violet-100">
                  Team members working in parallel
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

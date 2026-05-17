"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getPublicApiBaseUrl,
  isLocalApiBaseUrl,
  normalizeApiBaseUrl,
} from "@/lib/api";
import type { MatchCreateResponse } from "@/lib/types";

function buildPlayerNames(playerCount: number) {
  return Array.from({ length: playerCount }, (_, index) => `Player ${index + 1}`);
}

function parseAgentUrls(value: string) {
  return value
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function getInitialUseArena() {
  return process.env.NEXT_PUBLIC_DEFAULT_USE_ARENA === "true";
}

function getInitialAgentUrls() {
  return process.env.NEXT_PUBLIC_DEFAULT_AGENT_URLS || "";
}

function getInitialBackendUrl() {
  const publicApiBaseUrl = getPublicApiBaseUrl();

  if (typeof window === "undefined") {
    return publicApiBaseUrl;
  }

  const savedApiBaseUrl = window.localStorage.getItem("socialcompact-api-base");

  if (!savedApiBaseUrl) {
    return publicApiBaseUrl;
  }

  const normalizedSavedApiBaseUrl = normalizeApiBaseUrl(savedApiBaseUrl);

  // A stale localhost value is common after local testing. Prefer the deployed
  // backend when Vercel has one configured so public demos work without editing.
  if (
    isLocalApiBaseUrl(normalizedSavedApiBaseUrl) &&
    !isLocalApiBaseUrl(publicApiBaseUrl)
  ) {
    return publicApiBaseUrl;
  }

  return normalizedSavedApiBaseUrl;
}

export default function StartPage() {
  const router = useRouter();
  const [backendUrl, setBackendUrl] = useState(getInitialBackendUrl);
  const [playerCount, setPlayerCount] = useState("2");
  const [maxRounds, setMaxRounds] = useState("1");
  const [useArena, setUseArena] = useState(getInitialUseArena);
  const [agentUrls, setAgentUrls] = useState(getInitialAgentUrls);
  const [status, setStatus] = useState(
    "Fill in the settings and click Start Match."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const normalizedBackendUrl = normalizeApiBaseUrl(backendUrl);
  const publicBackendUrl = getPublicApiBaseUrl();
  const backendIsPublic = !isLocalApiBaseUrl(normalizedBackendUrl);
  const publicBackendConfigured = !isLocalApiBaseUrl(publicBackendUrl);
  const runModeLabel =
    useArena && backendIsPublic
      ? "Public Real Agent"
      : useArena
        ? "Local Arena"
        : "Local Simulation";

  function usePublicBackend() {
    setBackendUrl(publicBackendUrl);
    setUseArena(true);
    setAgentUrls("");
    window.localStorage.setItem("socialcompact-api-base", publicBackendUrl);
    setStatus("Public Render backend selected. Start a match when ready.");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const players = Number(playerCount);
    const rounds = Number(maxRounds);
    const apiBase = normalizeApiBaseUrl(backendUrl);

    if (!Number.isInteger(players) || players < 2) {
      setStatus("Player count must be an integer of at least 2.");
      return;
    }

    if (!Number.isInteger(rounds) || rounds < 1) {
      setStatus("Max rounds must be an integer of at least 1.");
      return;
    }

    setIsSubmitting(true);
    setStatus(
      useArena && !isLocalApiBaseUrl(apiBase)
        ? "Waking Render Arena and Agent services, then starting the match. Free Render services may take up to one minute after sleeping."
        : `Starting match through ${apiBase}...`
    );

    try {
      window.localStorage.setItem("socialcompact-api-base", apiBase);

      const response = await fetch(`${apiBase}/api/matches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game: "Survivor",
          players: buildPlayerNames(players),
          rounds,
          player_urls: useArena ? parseAgentUrls(agentUrls) : [],
          use_arena: useArena,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Backend returned ${response.status}`);
      }

      const data = (await response.json()) as MatchCreateResponse;
      setStatus(data.message);
      router.push(
        `/results?matchId=${encodeURIComponent(data.id)}&apiBase=${encodeURIComponent(
          apiBase
        )}`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to start match.";
      setStatus(
        `Could not reach the backend. Start web-backend first, then try again. ${message}`
      );
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a_45%,_#111827)] text-white">
      <section className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        <div className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Match Setup
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Configure the Survivor match and launch the demo flow.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            Back Home
          </Link>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">
              Survivor
            </p>

            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
              Start Survivor Match
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Fill in the backend URL and match settings below. The Vercel
              frontend can connect to a local or remote FastAPI game server.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-sm font-semibold text-cyan-300">
                  Current Mode
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {runModeLabel}. Use the deployed backend for a shareable
                  browser demo.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-sm font-semibold text-cyan-300">
                  Backend Status
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {backendIsPublic
                    ? "Connected to a public Render backend."
                    : "Using localhost. Only your computer can reach this backend."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/7 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur">
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-cyan-300">
                Match Form
              </p>

              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Backend URL
                  </label>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                        backendIsPublic
                          ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                          : "border-amber-300/25 bg-amber-300/10 text-amber-100"
                      }`}
                    >
                      {backendIsPublic ? "Public backend" : "Local backend"}
                    </span>
                    {publicBackendConfigured ? (
                      <button
                        type="button"
                        onClick={usePublicBackend}
                        className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/15"
                      >
                        Use Render backend
                      </button>
                    ) : null}
                  </div>
                  <input
                    value={backendUrl}
                    onChange={(event) => setBackendUrl(event.target.value)}
                    placeholder="http://127.0.0.1:8000"
                    className="w-full rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 font-mono text-sm text-cyan-50 outline-none focus:border-cyan-300"
                  />
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    If the backend runs on your computer, use
                    http://127.0.0.1:8000. If it is deployed online, paste that
                    public backend URL here. For this project, use the Render
                    URL during public demos.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Game Name
                  </label>
                  <input
                    value="Survivor"
                    disabled
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Player Count
                  </label>
                  <input
                    type="number"
                    min="2"
                    value={playerCount}
                    onChange={(e) => setPlayerCount(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Max Rounds
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxRounds}
                    onChange={(e) => setMaxRounds(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
                  />
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={useArena}
                    onChange={(event) => setUseArena(event.target.checked)}
                    className="mt-1 h-4 w-4 accent-cyan-300"
                  />
                  <span>
                    Use Arena when available
                    <span className="mt-1 block text-xs leading-5 text-slate-400">
                      Turn this on for real Agent mode. If the backend already
                      has public Agent URLs configured, you can leave the URL
                      box below empty.
                    </span>
                  </span>
                </label>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Player Agent URLs
                  </label>
                  <textarea
                    value={agentUrls}
                    onChange={(event) => setAgentUrls(event.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
                  />
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Only used when Arena mode is enabled. Leave blank to use
                    the backend&apos;s configured public Agent services, or put
                    one custom URL per line.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Starting..." : "Start Match"}
                </button>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  {status}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

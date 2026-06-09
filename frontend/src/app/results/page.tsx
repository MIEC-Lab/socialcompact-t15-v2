/*
 * Authorship: Chonglin Dong (C) owns the results entry route and results-page shell.
 * Scope: Route wrapper for the V2 results experience.
 */

import { Suspense } from "react";
import { ResultsClient } from "./results-client";

export const dynamic = "force-dynamic";

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsFallback />}>
      <ResultsClient />
    </Suspense>
  );
}

function ResultsFallback() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#020617,_#0f172a_45%,_#111827)] text-white">
      <section className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
        <div className="rounded-[32px] border border-cyan-300/20 bg-cyan-300/10 p-8 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-100">
            Loading Result
          </p>
          <h1 className="mt-4 text-4xl font-black">Preparing Result View</h1>
          <p className="mt-4 leading-7 text-cyan-50/90">
            The browser is reading the match id and backend URL.
          </p>
        </div>
      </section>
    </main>
  );
}

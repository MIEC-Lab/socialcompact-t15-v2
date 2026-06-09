"use client";

/*
 * Authorship: Chenle Chen (D) owns the live refresh behavior for process visualization.
 * Scope: Keeps result views in sync while live logs and timeline data update.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type ResultsAutoRefreshProps = {
  enabled: boolean;
};

export function ResultsAutoRefresh({ enabled }: ResultsAutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const intervalId = window.setInterval(() => {
      router.refresh();
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [enabled, router]);

  return null;
}

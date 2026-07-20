"use client";

import { useCallback, useEffect, useState } from "react";
import { catalystApiBase, type IntelligencePayload } from "@/lib/intelligence";

export function useLiveIntelligence(refreshMs = 30_000) {
  const [data, setData] = useState<IntelligencePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(`${catalystApiBase}/intelligence`, { cache: "no-store", signal });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || body.error || `Catalyst returned ${response.status}`);
      }
      setData(await response.json());
      setError(null);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : "Unable to reach Catalyst.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const initialTimer = window.setTimeout(() => void refresh(controller.signal), 0);
    const timer = window.setInterval(() => void refresh(), refreshMs);
    return () => {
      controller.abort();
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [refresh, refreshMs]);

  return { data, error, loading, refresh: () => refresh() };
}

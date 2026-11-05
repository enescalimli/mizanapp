"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DisclosureItem, DisclosuresApiResponse } from "@/types/disclosure";

export function useLiveDisclosures(pollIntervalMs = 25000, ticker?: string) {
  const [disclosures, setDisclosures] = useState<DisclosureItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());

  const fetchDisclosures = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const tickerParam = ticker ? `&ticker=${encodeURIComponent(ticker.toUpperCase().trim())}` : "";
      const res = await fetch(`/api/disclosures?_t=${Date.now()}${tickerParam}`, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const data: DisclosuresApiResponse = await res.json();

      if (data.items && Array.isArray(data.items)) {
        // Tag newly arrived disclosures if we already had items
        const taggedItems = data.items.map((item) => ({
          ...item,
          isNew: knownIdsRef.current.size > 0 && !knownIdsRef.current.has(item.id),
        }));

        // Add all IDs to known set
        data.items.forEach((item) => knownIdsRef.current.add(item.id));

        setDisclosures(taggedItems);
        setUpdatedAt(data.updatedAt);
        setError(null);
      }
    } catch (err: unknown) {
      console.error("useLiveDisclosures fetch failed:", err);
      setError("Canlı akış bağlantısı kurulamadı");
    } finally {
      setLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, [ticker]);

  useEffect(() => {
    fetchDisclosures(false);
    const interval = setInterval(() => {
      fetchDisclosures(false);
    }, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchDisclosures, pollIntervalMs]);

  const kapDisclosures = disclosures.filter((d) => d.source === "KAP");
  const spkDisclosures = disclosures.filter((d) => d.source === "SPK");

  return {
    disclosures,
    kapDisclosures,
    spkDisclosures,
    loading,
    isRefreshing,
    updatedAt,
    error,
    refresh: () => fetchDisclosures(true),
  };
}

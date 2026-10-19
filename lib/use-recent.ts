import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { api, type Chat, type Sol, type SolDetail } from "./api";
import { cacheEpoch, isFresh, readCache, writeCache } from "./cache";
import { useApi } from "./use-api";

export type RecentChat = Chat & { sol: Sol };

const detailPath = (id: string) => `/api/sols/${id}`; // same key as useApi on the Sol screens, so they open from cache too
const toRecent = (ds: SolDetail[]) => ds.flatMap((d) => [...d.scenarios, ...d.coachChats].map((c) => ({ ...c, sol: d.sol }))).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
const cachedRecent = (sols: Sol[] | null) => {
  const ds = sols?.slice(0, 5).map((s) => readCache<SolDetail>(detailPath(s.id)));
  return ds?.every(Boolean) ? toRecent(ds as SolDetail[]) : null;
};

/** Sols plus every chat of the first five, newest first, seeded from cache. `chats` is null while loading; `error` when the detail fetch failed;
 *  `fetching` while either refetch runs. Within the TTL a focus costs no requests at all. */
export function useRecentChats() {
  const { data: sols, error: solsError, refreshing, refresh, fetching: solsFetching } = useApi<Sol[]>("/api/sols");
  const [chats, setChats] = useState<RecentChat[] | null>(() => cachedRecent(sols));
  const [detailError, setError] = useState<string | null>(null);
  const [inFlight, setInFlight] = useState(false);
  const error = solsError ?? detailError;
  // on focus too, not only when `sols` changes: details can expire while the Sols list is still fresh
  useFocusEffect(useCallback(() => {
    if (!sols) return;
    const top = sols.slice(0, 5);
    // details expire with the list (TTL, any write, pull-to-refresh invalidates first), so fresh ones need no request
    if (top.every((s) => isFresh(detailPath(s.id)))) { setChats(cachedRecent(sols)); setInFlight(false); return; } // a cancelled run may have left it on
    let stale = false; const e = cacheEpoch(), at = Date.now();
    setError(null); setInFlight(true);
    // shortcut: no cross-Sol chats endpoint, so fetch the first 5 Sols' details; add GET /api/chats once Sols outgrow this.
    Promise.all(top.map((s) => api<SolDetail>(detailPath(s.id))))
      .then((ds) => { if (stale) return; if (e === cacheEpoch()) ds.forEach((d) => writeCache(detailPath(d.sol.id), d, at)); setChats(toRecent(ds)); })
      .catch((e: Error) => { if (!stale) setError(e.message); })
      .finally(() => { if (!stale) setInFlight(false); });
    return () => { stale = true; };
  }, [sols]));
  return { sols, chats, error, refreshing, refresh, fetching: solsFetching || inFlight };
}

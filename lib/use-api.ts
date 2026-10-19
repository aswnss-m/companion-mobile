import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { api } from "./api";
import { cacheEpoch, invalidateCache, isFresh, readCache, writeCache } from "./cache";

/** "ttl": start from cache and skip the network on focus while the entry is fresh (see TTL in cache.ts).
 *  "always": start from cache but refetch on every focus, for screens that write back what they show.
 *  "none": never touch the cache, for screens that must only ever see live data. */
export type CacheMode = "ttl" | "always" | "none";

/** GET `path` on focus; `reload` always hits the network, and `refresh` (pull-to-refresh) also marks every cached entry stale. `error` is the last failed load's message,
 *  `fetching` while the latest load is in flight, `fresh` once a network response landed in this mount (cached data may be stale). */
export function useApi<T>(path: string, mode: CacheMode = "ttl") {
  const cache = mode !== "none";
  const [data, setData] = useState<T | null>(() => (cache ? readCache<T>(path) : null));
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fresh, setFresh] = useState(false);
  const seq = useRef(0); // a slower, older load must not overwrite a newer one
  const load = useCallback(() => {
    const n = ++seq.current, e = cacheEpoch(), at = Date.now();
    setError(null); setFetching(true);
    return api<T>(path)
      .then((d) => { if (n !== seq.current) return; setData(d); setFresh(true); if (cache && e === cacheEpoch()) writeCache(path, d, at); })
      .catch((e: Error) => { if (n === seq.current) setError(e.message); })
      .finally(() => { if (n === seq.current) setFetching(false); });
  }, [path, cache]);
  useFocusEffect(useCallback(() => {
    if (mode !== "ttl" || !isFresh(path)) { load(); return; }
    setData(readCache<T>(path)); // another screen may have refreshed this entry since we mounted
  }, [load, mode, path]));
  const refresh = () => { invalidateCache(); setRefreshing(true); load().finally(() => setRefreshing(false)); };
  return { data, error, refreshing, refresh, reload: load, fetching, fresh };
}

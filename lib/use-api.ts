import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { api } from "./api";

/** GET `path` on every focus; `refresh` for pull-to-refresh. `error` is the last failed load's message, shown inline by the screen. */
export function useApi<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(() => { setError(null); return api<T>(path).then(setData).catch((e: Error) => setError(e.message)); }, [path]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const refresh = () => { setRefreshing(true); load().finally(() => setRefreshing(false)); };
  return { data, error, refreshing, refresh, reload: load };
}

import { useEffect, useState } from "react";
import { api, type Chat, type Sol, type SolDetail } from "./api";
import { useApi } from "./use-api";

export type RecentChat = Chat & { sol: Sol };

/** Sols plus every chat of the first five, newest first. `chats` is null while loading; `error` when the detail fetch failed. */
export function useRecentChats() {
  const { data: sols, error: solsError, refreshing, refresh } = useApi<Sol[]>("/api/sols");
  const [chats, setChats] = useState<RecentChat[] | null>(null);
  const [detailError, setError] = useState<string | null>(null);
  const error = solsError ?? detailError;
  useEffect(() => {
    if (!sols) return;
    setError(null);
    // shortcut: no cross-Sol chats endpoint, so fetch the first 5 Sols' details; add GET /api/chats once Sols outgrow this.
    Promise.all(sols.slice(0, 5).map((s) => api<SolDetail>(`/api/sols/${s.id}`)))
      .then((ds) => setChats(ds.flatMap((d) => [...d.scenarios, ...d.coachChats].map((c) => ({ ...c, sol: d.sol }))).sort((a, b) => b.createdAt.localeCompare(a.createdAt))))
      .catch((e: Error) => setError(e.message));
  }, [sols]);
  return { sols, chats, error, refreshing, refresh };
}

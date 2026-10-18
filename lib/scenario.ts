import { useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { api, type Chat } from "./api";

/** POST /api/sols/{id}/scenarios then open the new chat. */
export function useStartScenario() {
  const [busy, setBusy] = useState(false);
  async function start(solId: string) {
    setBusy(true);
    try { router.push(`/chats/${(await api<Chat>(`/api/sols/${solId}/scenarios`, { method: "POST" })).id}`); }
    catch (e) { Alert.alert("Couldn't start a scenario", (e as Error).message); }
    finally { setBusy(false); }
  }
  return { start, busy };
}

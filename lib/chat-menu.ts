import { Alert } from "react-native";
import { api, type Chat } from "./api";

const run = (p: Promise<unknown>, onDone: () => void) => p.then(onDone, (e: Error) => Alert.alert("Something went wrong", e.message));

export const archiveChat = (c: Chat, onDone: () => void) =>
  run(api(`/api/chats/${c.id}`, { method: "PATCH", body: JSON.stringify({ archived: !c.archivedAt }) }), onDone);

/** Asks first: a delete can't be undone. `onCancel` lets a swiped row close again. */
export const deleteChat = (c: Chat, onDone: () => void, onCancel?: () => void) => Alert.alert("Delete this chat?", "It's gone for good. A scored scene stops counting toward readiness.", [
  { text: "Cancel", style: "cancel", onPress: onCancel },
  { text: "Delete", style: "destructive", onPress: () => run(api(`/api/chats/${c.id}`, { method: "DELETE" }), onDone) },
]);

/** Long-press menu for one chat: archive (or restore) it, or delete it after a second confirm. */
export function chatMenu(c: Chat, onDone: () => void) {
  Alert.alert(c.kind === "scenario" ? c.scenario?.title ?? "Scenario" : "Coach chat", undefined, [
    { text: c.archivedAt ? "Unarchive" : "Archive", onPress: () => archiveChat(c, onDone) },
    { text: "Delete", style: "destructive", onPress: () => deleteChat(c, onDone) },
    { text: "Cancel", style: "cancel" },
  ]);
}

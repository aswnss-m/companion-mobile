import type { Chat } from "./api";

const RANKS: [number, string][] = [[75, "Ready"], [50, "Comfortable"], [25, "Warming up"], [0, "Stranger"]];
export const rankLabel = (r: number | null) => (r == null ? "Not practised yet" : RANKS.find(([min]) => r >= min)![1]);

/** Title for a coach chat in history lists: the first user line, trimmed. */
export function chatTitle(messages: { role: string; parts: { type: string; text?: string }[] }[]) {
  const first = messages.find((m) => m.role === "user")?.parts.find((p) => p.type === "text")?.text?.trim();
  return first ? (first.length > 48 ? `${first.slice(0, 47)}…` : first) : "New chat";
}

/** "now", "5m", "2h", "3d", "2w" from an ISO date. */
export function timeAgo(iso: string) {
  const m = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  if (m < 1440) return `${Math.floor(m / 60)}h`;
  return m < 10080 ? `${Math.floor(m / 1440)}d` : `${Math.floor(m / 10080)}w`;
}

/** A scenario with no reply yet is "open" (continue it); replied but ungraded is "in progress". Coach chats get no chip. */
export const isOpen = (c: Chat) => !c.result && !c.messages.some((m) => m.role === "user");
export const chatChip = (c: Chat) => (c.kind === "coach" ? undefined : c.result ? String(c.result.score) : isOpen(c) ? "Open" : "In progress");
export const chatLabel = (c: Chat) => (c.kind === "coach" ? chatTitle(c.messages) : c.scenario?.title ?? "Scenario");

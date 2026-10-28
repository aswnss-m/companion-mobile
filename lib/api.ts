import { fetch as expoFetch } from "expo/fetch";
import { API_URL, authClient } from "./auth-client";
import { invalidateCache } from "./cache";

export const AI_MISSING = "No AI key yet. Add ANTHROPIC_API_KEY to web/.env.local and restart the server.";

/** fetch against the Next.js API with the better-auth session cookie attached (credentials must be 'omit'). */
export async function apiFetch(path: string, init: RequestInit = {}) {
  const res = await expoFetch(`${API_URL}${path}`, {
    ...init,
    credentials: "omit",
    headers: { "Content-Type": "application/json", ...(init.headers as Record<string, string>), Cookie: await authClient.getCookie() },
  } as never);
  // any write can change any list; after the response so a GET racing the write stays stale. Chat streams also invalidate on finish.
  if ((init.method ?? "GET") !== "GET") invalidateCache();
  return res;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) throw new Error(res.status === 503 ? AI_MISSING : (await res.json().catch(() => ({ error: res.statusText }))).error ?? "Request failed");
  return res.status === 204 ? (undefined as T) : res.json();
}

export type Trait = { id: string; title: string; body: string };
export const BASE_TRAITS = ["Who they are", "How they talk", "What they care about", "Avoid", "Notes"];
export const USER_TRAITS = ["Who I am", "How I talk", "What I care about", "What I find hard", "Notes"]; // web/lib/traits.ts
/** GET /api/me/traits: the user's own traits (null until set up) and the onboarding questions (no options = short answer). */
export type Me = { traits: Trait[] | null; questions: { q: string; options?: string[] }[] };
export type Sol = { id: string; name: string; relationship: string; gender: "male" | "female" | "undisclosed"; traits: Trait[]; readiness: number | null; lastMessage?: string | null; createdAt: string; updatedAt: string };
export type Scenario = { title: string; setting: string; goal: string; openingLine: string };
export type ScenarioResult = { score: number; summary: string; wentWell: string[]; tryNext: string[] };
export type Chat = { id: string; solId: string; kind: "coach" | "scenario"; messages: import("ai").UIMessage[]; scenario: Scenario | null; result: ScenarioResult | null; endedAt: string | null; archivedAt: string | null; createdAt: string };
export type SolDetail = { sol: Sol; coachChats: Chat[]; scenarios: Chat[]; archived: Chat[] };

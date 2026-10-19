import { Directory, File, Paths } from "expo-file-system";

/** Last good GET response per API path: in memory, mirrored to the cache dir so a cold start renders without a skeleton. */
const dir = new Directory(Paths.cache, "api");
const owner = new File(Paths.cache, "api-owner"); // outside `dir` so clearCache keeps it
const staleFile = new File(Paths.cache, "api-stale");
type Entry = { at: number; data: unknown };
const mem = new Map<string, Entry>();
let current: string | null = null;
let epoch = 0; // bumped on every wipe, so a GET sent before it can't write the old account's data back
export const cacheEpoch = () => epoch;
const fileFor = (path: string) => new File(dir, `${path.replace(/[^\w-]/g, "_")}.json`); // no % escapes: the native side decodes URIs

/** Entries younger than this skip the network on focus. Every write the app makes invalidates first, so this only bounds
 *  how long a change made elsewhere (web, another phone) takes to show without a pull-to-refresh. */
export const TTL = 5 * 60_000;
let staleBefore: number | null = null; // entries fetched before this are stale; persisted so a relaunch after a write still refetches
const getStaleBefore = () => staleBefore ??= (() => { try { return staleFile.exists ? Number(staleFile.textSync()) || 0 : 0; } catch { return 0; } })();

function entry(path: string): Entry | null {
  if (mem.has(path)) return mem.get(path)!;
  try {
    const f = fileFor(path); if (!f.exists) return null;
    const v = JSON.parse(f.textSync()) as Entry;
    if (typeof v?.at !== "number" || !("data" in v)) return null; // pre-TTL file format
    mem.set(path, v); return v;
  } catch { return null; } // corrupt or unreadable file is a miss
}

export const readCache = <T,>(path: string) => (entry(path)?.data ?? null) as T | null;

/** True while the cached copy is inside the TTL and no write has happened since it was fetched. */
export function isFresh(path: string) {
  const e = entry(path);
  return !!e && e.at > getStaleBefore() && Date.now() - e.at < TTL;
}

/** `at` is when the request started, so a GET in flight across a write is still stale afterwards. */
export function writeCache(path: string, data: unknown, at = Date.now()) {
  const e = { at, data };
  mem.set(path, e);
  try { dir.create({ intermediates: true, idempotent: true }); fileFor(path).write(JSON.stringify(e)).catch(() => {}); } catch { /* best effort */ }
}

/** Marks every entry stale (kept for instant display, refetched on next focus). Called on any non-GET request. */
export function invalidateCache() {
  staleBefore = Date.now();
  try { staleFile.write(String(staleBefore)).catch(() => {}); } catch { /* best effort */ }
}

export function clearCache() {
  mem.clear(); epoch++;
  try { if (dir.exists) dir.delete(); } catch { /* best effort */ }
}

/** Wipe the cache when a different account signs in. Sync, so it runs before screens' useState initializers read it. */
export function cacheOwner(userId: string) {
  if (current === userId) return;
  current = userId;
  try { if (owner.exists && owner.textSync() === userId) return; } catch { /* unreadable: treat as a different owner */ }
  clearCache();
  try { owner.write(userId).catch(() => {}); } catch { /* best effort */ }
}

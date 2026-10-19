import { useState } from "react";
import { Alert, Share, View } from "react-native";
import { Cta } from "@/components/cta";
import { GlowButton } from "@/components/glow-button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";

const GRAB_LIMITS = [1, 3, 5, 10, null]; // same as web/lib/grab.ts; null = always open
export type Grab = { id: string; url: string; maxAnswers: number | null };

/** Sol Grab share dialog, like web's components/sol-grab-dialog.tsx: add people by email, pick how many can answer, share the link.
 *  No copy button: the system share sheet already has Copy. With no `link` it opens the owner's current link (New Sol, glow button);
 *  with one it reopens that link from `renderTrigger` (the You tab list), calling `onChange` after the limit changes. */
export function SolGrabDialog({ link, renderTrigger, onChange }: { link?: Grab; renderTrigger?: (open: () => void) => React.ReactNode; onChange?: () => void }) {
  const [open, setOpen] = useState(false);
  const [grab, setGrab] = useState<Grab | null>(link ?? null);
  const [failed, setFailed] = useState(false);
  const [emails, setEmails] = useState("");
  const [sending, setSending] = useState(false);

  async function load() {
    setFailed(false);
    try { setGrab(await api<Grab>("/api/grabs", { method: "POST" })); }
    catch { setFailed(true); }
  }
  async function choose(maxAnswers: number | null) {
    if (!grab || grab.maxAnswers === maxAnswers) return;
    const before = grab.maxAnswers;
    setGrab({ ...grab, maxAnswers }); // optimistic; put it back if the save fails
    try { await api(`/api/grabs/${grab.id}`, { method: "PATCH", body: JSON.stringify({ maxAnswers }) }); onChange?.(); }
    catch (e) { setGrab((g) => g && { ...g, maxAnswers: before }); Alert.alert("Couldn't change that", (e as Error).message); }
  }
  async function invite() {
    const list = emails.split(/[\s,;]+/).filter(Boolean);
    if (!grab || !list.length) return;
    setSending(true);
    try {
      const r = await api<{ sent: number; failed: number }>(`/api/grabs/${grab.id}/invite`, { method: "POST", body: JSON.stringify({ emails: list }) });
      setEmails("");
      Alert.alert(`Sent to ${r.sent} ${r.sent === 1 ? "person" : "people"}`, r.failed ? `${r.failed} couldn't be sent.` : undefined);
    } catch (e) { Alert.alert("Couldn't send the invites", (e as Error).message); }
    finally { setSending(false); }
  }

  const show = () => { setOpen(true); if (!grab) load(); };

  return (
    <>
      {renderTrigger ? renderTrigger(show) : <GlowButton label="Sol Grab" onPress={show} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-5">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Sol Grab</DialogTitle>
            <DialogDescription>Send a link with a few questions. Each answer becomes a Sol.</DialogDescription>
          </DialogHeader>

          <View className="gap-1.5">
            <Text className="text-sm font-sans-medium">Add people</Text>
            <View className="flex-row items-center gap-2">
              <Input value={emails} onChangeText={setEmails} placeholder="Emails, separated by commas" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} editable={!!grab} className="flex-1 rounded-input" />
              <Cta ghost label={sending ? "Sending…" : "Send"} disabled={!grab || sending || !emails.trim()} onPress={invite} className="px-4 py-2.5" />
            </View>
          </View>

          <View className="gap-1.5">
            <Text className="text-sm font-sans-medium">How many people can answer</Text>
            {/* compact pills so "Always open" sits on the numbers' row; wraps only on very narrow screens */}
            <View className="flex-row flex-wrap gap-1.5">
              {GRAB_LIMITS.map((n) => <Cta key={n ?? "open"} ghost label={n === null ? "Always open" : String(n)} accessibilityState={{ selected: grab?.maxAnswers === n }} disabled={!grab} onPress={() => choose(n)} className={`min-w-11 px-3 py-1.5 ${grab?.maxAnswers === n ? "bg-paper-3" : ""}`} />)}
            </View>
          </View>

          <View className="gap-1.5">
            <Text className="text-sm font-sans-medium">Link</Text>
            {failed ? <Cta ghost label="Couldn't make a link. Try again" onPress={load} className="self-start px-4 py-2" />
              : <View className="min-h-12 justify-center rounded-input border border-rule px-4 py-3">{grab ? <Text selectable className="text-ink-2" numberOfLines={2}>{grab.url}</Text> : <Text className="text-ink-2">Making your link…</Text>}</View>}
          </View>

          <DialogFooter className="flex-row items-center justify-end">
            <Cta label="Share" disabled={!grab} onPress={() => grab && Share.share({ message: grab.url })} className="px-6 py-2.5" />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

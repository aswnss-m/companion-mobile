import { useState } from "react";
import { ScrollView, View } from "react-native";
import { FileArchive, MessagesSquare } from "lucide-react-native";
import { ActionCard } from "@/components/action-card";
import { Cta } from "@/components/cta";
import { PressableScale } from "@/components/pressable-scale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { useColors } from "@/lib/theme";
import { pickChatText } from "@/lib/whatsapp";

type Person = { name: string; count: number };
type Fact = { trait: string; fact: string; evidence: string };
type Pick = "newest" | "oldest" | "middle" | "random"; // web/lib/whatsapp.ts PICKS
type Step = { at: "file" } | { at: "who"; people: Person[]; total: number; limit: number } | { at: "facts"; facts: Fact[] };
const PICK_OPTIONS: { pick: Pick; title: string; hint: string }[] = [
  { pick: "newest", title: "Newest", hint: "How they talk with you now" },
  { pick: "oldest", title: "Oldest", hint: "How the chat started" },
  { pick: "middle", title: "Middle", hint: "The stretch in between" },
  { pick: "random", title: "Random", hint: "Stretches of 100 from all over" },
];

/** Import a WhatsApp "Export chat" file, like web's components/whatsapp-import.tsx: pick the file, say who the Sol is,
 *  keep the facts worth keeping. Without a Sol it reads the user's own messages into their own traits.
 *  The chat text lives in this component while the dialog is open; only kept facts are saved. */
export function WhatsAppImport({ solId, solName, onSaved }: { solId?: string; solName?: string; onSaved: () => void }) {
  const self = !solId || !solName;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>({ at: "file" });
  const [text, setText] = useState("");
  const colors = useColors();
  const [sender, setSender] = useState("");
  const [pick, setPick] = useState<Pick>("newest");
  const [kept, setKept] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const read = (body: { text: string; sender?: string; pick?: Pick }) =>
    api<{ participants?: Person[]; total?: number; limit?: number; facts?: Fact[] }>(self ? "/api/me/whatsapp" : `/api/sols/${solId}/whatsapp`, { method: "POST", body: JSON.stringify(body) });

  function reset(next: boolean) {
    setOpen(next);
    if (next) return;
    setStep({ at: "file" }); setText(""); setSender(""); setPick("newest"); setError(null); setBusy(null);
  }
  async function attempt(label: string, work: () => Promise<void>) {
    setBusy(label); setError(null);
    await work().catch((e: Error) => setError(e.message));
    setBusy(null);
  }
  const openFile = () => attempt("Opening the chat…", async () => {
    const t = await pickChatText();
    if (!t) return;
    const { participants = [], total = 0, limit = Infinity } = await read({ text: t });
    const guess = self ? undefined : participants.find((p) => p.name.toLowerCase().includes(solName.toLowerCase()) || solName.toLowerCase().includes(p.name.toLowerCase()));
    setText(t); setSender(guess?.name ?? ""); setStep({ at: "who", people: participants, total, limit });
  });
  const analyse = () => attempt("Reading the chat…", async () => {
    const { facts = [] } = await read({ text, sender, pick });
    setText(""); // done with the chat itself
    setKept(new Set(facts.map((_, i) => i)));
    setStep({ at: "facts", facts });
  });
  const save = (facts: Fact[]) => attempt("Saving…", async () => {
    await api(self ? "/api/me/traits" : `/api/sols/${solId}/character`, { method: "POST", body: JSON.stringify({ facts: facts.filter((_, i) => kept.has(i)).map(({ fact, trait }) => ({ fact, trait })) }) });
    reset(false);
    onSaved();
  });
  const toggle = (i: number) => setKept((k) => { const n = new Set(k); if (n.has(i)) n.delete(i); else n.add(i); return n; });

  return (
    <>
      <ActionCard tint={1} icon={MessagesSquare} title="Import WhatsApp chat" subtitle={self ? "Learn how you talk" : `Learn how ${solName} talks`} onPress={() => setOpen(true)} />
      <Dialog open={open} onOpenChange={reset}>
        <DialogContent className="max-h-[85%] gap-5">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Import a chat</DialogTitle>
            <DialogDescription>
              {step.at === "file" ? (self
                  ? "In WhatsApp open a chat with someone you talk to a lot, tap their name, then Export chat (without media is enough). Pick the .zip or .txt here. Only your own messages are read for your traits."
                  : `In WhatsApp open your chat with ${solName}, tap their name, then Export chat (without media is enough). Pick the .zip or .txt here.`)
                : step.at === "who" ? (self ? "Which one is you?" : `Which one is ${solName}?`)
                : step.facts.length ? "Untick anything that isn't right. The rest goes into the character."
                : "Nothing new turned up. The character already covers what this chat shows."}
            </DialogDescription>
          </DialogHeader>

          {step.at === "file" && (
            <View className="gap-3">
              <PressableScale accessibilityRole="button" accessibilityLabel="Choose the chat export" disabled={!!busy} onPress={openFile}
                className="items-center gap-3 rounded-card border-2 border-dashed border-rule bg-card px-6 py-10">
                <View className="h-12 w-12 items-center justify-center rounded-chip bg-paper"><FileArchive size={24} color={colors.ink} /></View>
                <View className="items-center">
                  <Text className="font-sans-semibold">{busy ?? "Choose the export"}</Text>
                  {!busy && <Text className="text-sm text-ink-2">.zip or .txt from Files</Text>}
                </View>
              </PressableScale>
              <Text className="text-sm text-ink-2">The chat is read once to pick out traits, then dropped. It is sent to the AI for that read and never saved.</Text>
            </View>
          )}

          {step.at === "who" && (
            <ScrollView className="max-h-[28rem]" contentContainerClassName="gap-5">
              <View className="gap-2">
                {step.people.map((p) => (
                  <PressableScale key={p.name} row accessibilityRole="radio" accessibilityState={{ checked: sender === p.name }} onPress={() => setSender(p.name)}
                    className={`flex-row items-center justify-between rounded-card p-4 ${sender === p.name ? "bg-tint-1" : "bg-card"}`}>
                    <Text className="font-sans-medium">{p.name}</Text>
                    <Text className="text-sm text-ink-2">{p.count} messages</Text>
                  </PressableScale>
                ))}
              </View>
              {step.total > step.limit && (
                <View className="gap-2">
                  <Text className="text-sm font-sans-medium">The chat has {step.total.toLocaleString()} messages. Companion reads {step.limit.toLocaleString()}. Which ones?</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {PICK_OPTIONS.map((o) => (
                      <PressableScale key={o.pick} row accessibilityRole="radio" accessibilityState={{ checked: pick === o.pick }} onPress={() => setPick(o.pick)}
                        className={`w-[48%] rounded-card p-4 ${pick === o.pick ? "bg-tint-2" : "bg-card"}`}>
                        <Text className="font-sans-semibold">{o.title}</Text>
                        <Text className="text-sm text-ink-2">{o.hint}</Text>
                      </PressableScale>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          )}

          {step.at === "facts" && step.facts.length > 0 && (
            <ScrollView className="max-h-96" contentContainerClassName="gap-2">
              {step.facts.map((f, i) => (
                <PressableScale key={i} row accessibilityRole="checkbox" accessibilityState={{ checked: kept.has(i) }} onPress={() => toggle(i)}
                  className={`gap-1 rounded-card p-4 ${kept.has(i) ? "bg-tint-1" : "bg-card opacity-60"}`}>
                  <Text className="text-xs font-sans-semibold uppercase tracking-widest text-ink-2">{kept.has(i) ? "✓ " : ""}{f.trait}</Text>
                  <Text>{f.fact}</Text>
                  <Text className="text-sm text-ink-2">“{f.evidence}”</Text>
                </PressableScale>
              ))}
            </ScrollView>
          )}

          {error && <Text accessibilityRole="alert" className="text-sm text-destructive">{error}</Text>}

          {step.at !== "file" && <DialogFooter className="flex-row items-center justify-end gap-2">
            {busy && <Text className="mr-auto text-sm text-ink-2">{busy}</Text>}
            {step.at === "who" && <Cta label="Read the chat" disabled={!!busy || !sender} onPress={analyse} className="px-6 py-2.5" />}
            {step.at === "facts" && (step.facts.length
              ? <Cta label={`Add ${kept.size} to character`} disabled={!!busy || !kept.size} onPress={() => save(step.facts)} className="px-6 py-2.5" />
              : <Cta label="Done" onPress={() => reset(false)} className="px-6 py-2.5" />)}
          </DialogFooter>}
        </DialogContent>
      </Dialog>
    </>
  );
}

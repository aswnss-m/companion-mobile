import { useState } from "react";
import { ScrollView, View } from "react-native";
import { MessagesSquare } from "lucide-react-native";
import { ActionCard } from "@/components/action-card";
import { Cta } from "@/components/cta";
import { PressableScale } from "@/components/pressable-scale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { pickChatText } from "@/lib/whatsapp";

type Person = { name: string; count: number };
type Fact = { trait: string; fact: string; evidence: string };
type Step = { at: "file" } | { at: "who"; people: Person[] } | { at: "facts"; facts: Fact[] };

/** Import a WhatsApp "Export chat" file, like web's components/whatsapp-import.tsx: pick the file, say who the Sol is,
 *  keep the facts worth keeping. The chat text lives in this component while the dialog is open; only kept facts are saved. */
export function WhatsAppImport({ solId, solName, onSaved }: { solId: string; solName: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>({ at: "file" });
  const [text, setText] = useState("");
  const [sender, setSender] = useState("");
  const [kept, setKept] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const read = (body: { text: string; sender?: string }) =>
    api<{ participants?: Person[]; facts?: Fact[] }>(`/api/sols/${solId}/whatsapp`, { method: "POST", body: JSON.stringify(body) });

  function reset(next: boolean) {
    setOpen(next);
    if (next) return;
    setStep({ at: "file" }); setText(""); setSender(""); setError(null); setBusy(null);
  }
  async function attempt(label: string, work: () => Promise<void>) {
    setBusy(label); setError(null);
    await work().catch((e: Error) => setError(e.message));
    setBusy(null);
  }
  const pick = () => attempt("Opening the chat…", async () => {
    const t = await pickChatText();
    if (!t) return;
    const { participants = [] } = await read({ text: t });
    const guess = participants.find((p) => p.name.toLowerCase().includes(solName.toLowerCase()) || solName.toLowerCase().includes(p.name.toLowerCase()));
    setText(t); setSender(guess?.name ?? ""); setStep({ at: "who", people: participants });
  });
  const analyse = () => attempt("Reading the chat…", async () => {
    const { facts = [] } = await read({ text, sender });
    setText(""); // done with the chat itself
    setKept(new Set(facts.map((_, i) => i)));
    setStep({ at: "facts", facts });
  });
  const save = (facts: Fact[]) => attempt("Saving…", async () => {
    await api(`/api/sols/${solId}/character`, { method: "POST", body: JSON.stringify({ facts: facts.filter((_, i) => kept.has(i)).map(({ fact, trait }) => ({ fact, trait })) }) });
    reset(false);
    onSaved();
  });
  const toggle = (i: number) => setKept((k) => { const n = new Set(k); if (n.has(i)) n.delete(i); else n.add(i); return n; });

  return (
    <>
      <ActionCard tint={1} icon={MessagesSquare} title="Import WhatsApp chat" subtitle={`Learn how ${solName} talks`} onPress={() => setOpen(true)} />
      <Dialog open={open} onOpenChange={reset}>
        <DialogContent className="max-h-[85%] gap-5">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Import a chat</DialogTitle>
            <DialogDescription>
              {step.at === "file" ? `In WhatsApp open your chat with ${solName}, tap their name, then Export chat (without media is enough). Pick the .zip or .txt here.`
                : step.at === "who" ? `Which one is ${solName}?`
                : step.facts.length ? "Untick anything that isn't right. The rest goes into the character."
                : "Nothing new turned up. The character already covers what this chat shows."}
            </DialogDescription>
          </DialogHeader>

          {step.at === "file" && (
            <View className="gap-3">
              <Cta label={busy ?? "Choose the export"} disabled={!!busy} onPress={pick} />
              <Text className="text-sm text-ink-2">The chat is read once to pick out traits, then dropped. It is sent to the AI for that read and never saved.</Text>
            </View>
          )}

          {step.at === "who" && (
            <View className="gap-2">
              {step.people.map((p) => (
                <PressableScale key={p.name} row accessibilityRole="radio" accessibilityState={{ checked: sender === p.name }} onPress={() => setSender(p.name)}
                  className={`flex-row items-center justify-between rounded-card p-4 ${sender === p.name ? "bg-tint-1" : "bg-card"}`}>
                  <Text className="font-sans-medium">{p.name}</Text>
                  <Text className="text-sm text-ink-2">{p.count} messages</Text>
                </PressableScale>
              ))}
            </View>
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

          <DialogFooter className="flex-row items-center justify-end gap-2">
            {busy && step.at !== "file" && <Text className="mr-auto text-sm text-ink-2">{busy}</Text>}
            {step.at === "who" && <Cta label="Read the chat" disabled={!!busy || !sender} onPress={analyse} className="px-6 py-2.5" />}
            {step.at === "facts" && (step.facts.length
              ? <Cta label={`Add ${kept.size} to character`} disabled={!!busy || !kept.size} onPress={() => save(step.facts)} className="px-6 py-2.5" />
              : <Cta label="Done" onPress={() => reset(false)} className="px-6 py-2.5" />)}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

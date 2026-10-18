import { useState } from "react";
import { Alert, View } from "react-native";
import Animated from "react-native-reanimated";
import { Plus } from "lucide-react-native";
import { Cta } from "@/components/cta";
import { Markdown } from "@/components/markdown";
import { PressableScale } from "@/components/pressable-scale";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { api, BASE_TRAITS, type Sol, type Trait } from "@/lib/api";
import { FADE_IN, FADE_OUT } from "@/lib/motion";
import { useColors } from "@/lib/theme";

const isBase = (title: string) => BASE_TRAITS.some((b) => b.toLowerCase() === title.trim().toLowerCase());
const NEW = "new";

/** The character as a stack of trait cards; each card edits on its own, every save PATCHes the whole list. */
export function TraitStack({ solId, traits: initial, onSaved }: { solId: string; traits: Trait[]; onSaved?: () => void }) {
  const [traits, setTraits] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null); // trait id, NEW, or null
  const [draft, setDraft] = useState({ title: "", body: "" });
  const [busy, setBusy] = useState(false);
  const colors = useColors();

  async function save(next: Trait[]) {
    setBusy(true);
    try { const s = await api<Sol>(`/api/sols/${solId}`, { method: "PATCH", body: JSON.stringify({ traits: next }) }); setTraits(s.traits); setEditing(null); onSaved?.(); }
    catch { Alert.alert("Couldn't save"); }
    finally { setBusy(false); }
  }
  const open = (t?: Trait) => { setDraft({ title: t?.title ?? "", body: t?.body ?? "" }); setEditing(t?.id ?? NEW); };
  const submit = () => {
    const title = draft.title.trim() || "Untitled";
    if (editing === NEW) return save([...traits, { id: `${Date.now()}`, title, body: draft.body }]);
    save(traits.map((t) => (t.id === editing ? { ...t, title: isBase(t.title) ? t.title : title, body: draft.body } : t)));
  };

  const editor = (custom: boolean) => (
    <Animated.View entering={FADE_IN} exiting={FADE_OUT} className="gap-3">
      {custom && <Input value={draft.title} onChangeText={(title) => setDraft((d) => ({ ...d, title }))} placeholder="Trait name, e.g. Pet peeves" className="rounded-input" />}
      <Textarea value={draft.body} onChangeText={(body) => setDraft((d) => ({ ...d, body }))} numberOfLines={6} placeholder="- one thing per line" className="min-h-32 rounded-input border-0 bg-paper text-sm leading-relaxed shadow-none" />
      <View className="flex-row flex-wrap gap-2">
        <Cta label={busy ? "Saving…" : "Save"} disabled={busy} onPress={submit} className="px-4 py-2" />
        <Cta ghost label="Cancel" disabled={busy} onPress={() => setEditing(null)} className="px-4 py-2" />
        {custom && editing !== NEW && <Cta ghost label="Delete" disabled={busy} onPress={() => save(traits.filter((t) => t.id !== editing))} className="px-4 py-2" />}
      </View>
    </Animated.View>
  );

  return (
    <View className="gap-3">
      {traits.map((t) => (
        <View key={t.id} className="rounded-card bg-card p-5">
          <View className="mb-2 flex-row items-center justify-between gap-3">
            <Text className="text-xs font-sans-semibold uppercase tracking-widest text-ink-2">{t.title}</Text>
            {editing !== t.id && <Cta ghost label="Edit" onPress={() => open(t)} className="px-3 py-1.5" />}
          </View>
          {editing === t.id ? editor(!isBase(t.title)) : <Animated.View entering={FADE_IN}><Markdown variant="doc">{t.body}</Markdown></Animated.View>}
        </View>
      ))}
      {editing === NEW ? (
        <View className="rounded-card bg-card p-5">{editor(true)}</View>
      ) : (
        <PressableScale row onPress={() => open()} className="flex-row items-center justify-center gap-2 rounded-card border border-rule px-5 py-4">
          <Plus size={16} color={colors.ink} /><Text className="font-sans-medium">Add a trait</Text>
        </PressableScale>
      )}
    </View>
  );
}

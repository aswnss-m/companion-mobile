import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BackLink, Cta } from "@/components/cta";
import { SolGrabDialog } from "@/components/sol-grab-dialog";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { api, type Sol } from "@/lib/api";

type Gender = "male" | "female" | "undisclosed";
const GENDER_OPTIONS: [Gender, string][] = [["male", "Male"], ["female", "Female"], ["undisclosed", "Prefer not to say"]];

export default function NewSol() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [about, setAbout] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit() {
    setBusy(true);
    try { router.replace(`/sols/${(await api<Sol>("/api/sols", { method: "POST", body: JSON.stringify({ name, relationship, gender, about }) })).id}`); }
    catch (e) { Alert.alert("Couldn't create that Sol", (e as Error).message); }
    finally { setBusy(false); }
  }
  return (
    <SafeAreaView className="flex-1 bg-paper">
      <KeyboardAwareScrollView contentContainerClassName="gap-5 px-4 pt-4 pb-10" keyboardShouldPersistTaps="handled">
        <BackLink />
        <View className="flex-row flex-wrap items-center justify-between gap-3"><Text className="font-serif text-3xl">New Sol</Text><View><SolGrabDialog /></View></View>
        <View className="gap-1.5"><Text className="text-sm font-sans-medium">Their name</Text><Input value={name} onChangeText={setName} maxLength={80} className="rounded-input" /></View>
        <View className="gap-1.5"><Text className="text-sm font-sans-medium">Who they are to you</Text><Input value={relationship} onChangeText={setRelationship} placeholder="my manager, a friend's friend, my sister" maxLength={80} className="rounded-input" /></View>
        <View className="gap-1.5">
          <Text className="text-sm font-sans-medium">Their gender</Text>
          <View className="flex-row gap-1 rounded-[18px] border border-rule p-1">
            {GENDER_OPTIONS.map(([value, label]) => (
              <Pressable key={value} accessibilityRole="radio" accessibilityState={{ selected: gender === value }} onPress={() => setGender(value)}
                className={`flex-1 items-center justify-center rounded-[14px] py-2.5 ${gender === value ? "bg-primary" : "active:bg-paper-3"}`}>
                <Text className={`text-center text-sm ${gender === value ? "text-primary-foreground" : "text-ink"}`}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View className="gap-1.5">
          <Text className="text-sm font-sans-medium">Tell me about them</Text>
          <Textarea value={about} onChangeText={setAbout} maxLength={5000} placeholder="How they talk, what they like, what makes conversations with them hard, anything that happened before." className="min-h-40 rounded-input" />
          <Text className="text-sm text-ink-2">This becomes their character document. You can edit it any time.</Text>
        </View>
        <Cta label={busy ? "Writing their character…" : "Create Sol"} disabled={busy || !name.trim() || !relationship.trim() || !gender || !about.trim()} onPress={submit} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

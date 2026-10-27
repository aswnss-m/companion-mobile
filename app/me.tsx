import { useEffect, useState } from "react";
import { Alert, RefreshControl, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { BackLink, Cta } from "@/components/cta";
import { PressableScale } from "@/components/pressable-scale";
import { EmptyState } from "@/components/recent-row";
import { TraitStack } from "@/components/trait-stack";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { WhatsAppImport } from "@/components/whatsapp-import";
import { api, USER_TRAITS, type Me, type Trait } from "@/lib/api";
import { markIntroSeen } from "@/lib/onboarding";
import { useApi } from "@/lib/use-api";

/** The user's own traits, like web's /app/you/traits; also the onboarding step (sign-up opens it with ?welcome). */
export default function MeScreen() {
  const { welcome } = useLocalSearchParams<{ welcome?: string }>();
  const { data, error, reload, fresh, refreshing, refresh } = useApi<Me>("/api/me/traits", "always"); // TraitStack saves the whole list, so never seed it from a stale cache
  useEffect(markIntroSeen, []); // whoever lands here has seen what's new
  const traits = data?.traits;
  return (
    <SafeAreaView className="flex-1 bg-paper">
      <KeyboardAwareScrollView contentContainerClassName="px-4 pt-4 pb-10" keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        {welcome ? <Text className="mb-4 text-ink-2">Welcome to Companion</Text> : <BackLink />}
        <Text className="font-serif text-3xl">{traits ? "About you" : "First, a bit about you"}</Text>
        <Text className="mt-2 mb-6 text-ink-2">
          {traits ? "Companion reads this before it sets a scenario, coaches you or scores you. Edit anything that isn't right."
            : "Companion knows the people you practise with. Knowing you too means scenarios you'd really face and scores that judge you as yourself. Skip anything you like."}
        </Text>
        {error && !data ? <EmptyState text={error} actionLabel="Retry" onPress={reload} /> : !data ? <Skeleton className="h-60 rounded-card" /> : (
          <View className="gap-6">
            <View className="gap-2">
              <WhatsAppImport onSaved={reload} />
              <Text className="text-sm text-ink-2">{traits ? "Add more from a chat: Companion reads your messages and suggests what to add." : "Or skip the questions: Companion can read how you talk from one of your chats."}</Text>
            </View>
            {!traits ? <SelfSetup questions={data.questions} onDone={reload} />
              : fresh ? <TraitStack key={JSON.stringify(traits)} traits={traits} base={USER_TRAITS} onSaved={reload}
                  save={(next) => api<{ traits: Trait[] }>("/api/me/traits", { method: "PATCH", body: JSON.stringify({ traits: next }) }).then((r) => r.traits)} />
              : <Skeleton className="h-60 rounded-card" />}
            {welcome && <Cta ghost={!traits} label={traits ? "Continue to Companion" : "Skip for now"} onPress={() => router.back()} />}
          </View>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

/** The short Sol Grab question set, answered by the user about themself. */
function SelfSetup({ questions, onDone }: { questions: Me["questions"]; onDone: () => void }) {
  const [answers, setAnswers] = useState<string[]>(() => questions.map(() => ""));
  const [busy, setBusy] = useState(false);
  const set = (i: number, v: string) => setAnswers((a) => a.with(i, v));
  async function submit() {
    setBusy(true);
    try { await api("/api/me/traits", { method: "POST", body: JSON.stringify({ answers: answers.map((a) => a.trim() || null) }) }); onDone(); }
    catch (e) { Alert.alert("Couldn't save that", (e as Error).message); }
    finally { setBusy(false); }
  }
  return (
    <View className="gap-7">
      {questions.map((g, i) => (
        <View key={i} className="gap-2">
          <Text className="font-sans-medium">{i + 1}. {g.q}</Text>
          {g.options ? g.options.map((o) => (
            <PressableScale key={o} row accessibilityRole="radio" accessibilityState={{ checked: answers[i] === o }} onPress={() => set(i, answers[i] === o ? "" : o)}
              className={`rounded-card p-4 ${answers[i] === o ? "bg-tint-1" : "bg-card"}`}>
              <Text>{o}</Text>
            </PressableScale>
          )) : <Textarea value={answers[i]} onChangeText={(v) => set(i, v)} maxLength={300} className="min-h-24 rounded-input" />}
        </View>
      ))}
      <Cta label={busy ? "Writing your character…" : "Save my answers"} disabled={busy || !answers.some((a) => a.trim())} onPress={submit} />
    </View>
  );
}

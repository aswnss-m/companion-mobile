import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import Animated from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { FADE_IN, FADE_IN_DOWN, FADE_OUT, staggered } from "@/lib/motion";
import { PressableScale } from "@/components/pressable-scale";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowRight, Check, ChevronDown, ChevronUp } from "lucide-react-native";
import { Bloom } from "@/components/bloom";
import { Chat } from "@/components/chat";
import { Mascot } from "@/components/mascot";
import { BackLink, Cta } from "@/components/cta";
import { EmptyState } from "@/components/recent-row";
import { RankChip } from "@/components/sol-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { api, type Chat as ChatRow, type ScenarioResult, type Sol } from "@/lib/api";
import { useStartScenario } from "@/lib/scenario";
import { useColors } from "@/lib/theme";
import { useApi } from "@/lib/use-api";

function Points({ title, items, tint, Icon, index }: { title: string; items: string[]; tint: string; Icon: typeof Check; index?: number }) {
  const entering = useMemo(() => (index == null ? undefined : staggered(index)), [index]); // only when the user just triggered the grade
  const colors = useColors();
  return (
    <Animated.View entering={entering} className={`gap-2 rounded-card p-5 ${tint}`}>
      <Text className="mb-1 font-sans-semibold">{title}</Text>
      {items.map((t) => <View key={t} className="flex-row gap-2"><Icon size={16} color={colors.ink} style={{ marginTop: 4 }} /><Text className="flex-1 leading-relaxed">{t}</Text></View>)}
    </Animated.View>
  );
}

export default function ChatPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error, reload } = useApi<{ chat: ChatRow; sol: Sol }>(`/api/chats/${id}`);
  const { start, busy: starting } = useStartScenario();
  const [graded, setResult] = useState<(ScenarioResult & { readiness?: number | null }) | null>(null);
  const result: (ScenarioResult & { readiness?: number | null }) | null = graded ?? data?.chat.result ?? null;
  const [busy, setBusy] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [open, setOpen] = useState(true);
  const colors = useColors();

  async function finish() {
    setBusy(true);
    setGradeError(null);
    try { const r = await api<ChatRow & { readiness: number | null }>(`/api/chats/${id}/finish`, { method: "POST" }); setResult({ ...r.result!, readiness: r.readiness }); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
    catch (e) { setGradeError(`Couldn't grade that yet. ${(e as Error).message}`); }
    finally { setBusy(false); }
  }

  if (error) return <SafeAreaView className="flex-1 bg-paper"><View className="px-4 pt-4"><BackLink /><EmptyState text={error} actionLabel="Retry" onPress={reload} /></View></SafeAreaView>;
  if (!data) return <SafeAreaView className="flex-1 bg-paper"><View className="px-4 pt-4"><BackLink /><Skeleton className="h-40 rounded-card" /></View></SafeAreaView>;
  const { chat, sol } = data;

  if (chat.kind === "coach")
    return (
      <SafeAreaView className="flex-1 bg-paper">
        <View className="px-4 pt-4"><BackLink /></View>
        <Chat
          id={`coach-${chat.id}`} api={`/api/chats/${chat.id}/messages`} solId={sol.id} solName={sol.name}
          initialMessages={chat.messages} placeholder={`How should I talk to ${sol.name}?`}
          header={<Text className="mt-2 text-sm text-ink-2">Coaching for <Text className="text-sm font-sans-medium text-ink">{sol.name}</Text></Text>}
        />
      </SafeAreaView>
    );

  const scenario = chat.scenario!;
  if (result) {
    return (
      <SafeAreaView className="flex-1 bg-paper">
        <ScrollView contentContainerClassName="px-4 pt-4 pb-10">
          <BackLink />
          <Text className="text-ink-2">{scenario.title}</Text>
          <Text className="mt-1 mb-6 font-serif text-3xl">How it went</Text>
          <Animated.View entering={graded ? FADE_IN_DOWN : undefined} className="overflow-hidden rounded-card bg-card p-6">
            <Bloom />
            <View className="mb-4"><Mascot state={result.score >= 50 ? "happy" : "sad"} height={28} /></View>
            <Text className="font-sans-semibold text-[64px] leading-none">{result.score}</Text>
            <Text className="mt-1 text-sm text-ink-2">out of 100</Text>
            <Text className="mt-5 leading-relaxed">{result.summary}</Text>
            {result.readiness != null && <View className="mt-5 flex-row items-center gap-2"><Text className="text-sm">Readiness with {sol.name}:</Text><RankChip readiness={result.readiness} /></View>}
          </Animated.View>
          <View className="mt-6 gap-3">
            <Points title="Went well" items={result.wentWell} tint="bg-bubble-3" Icon={Check} index={graded ? 1 : undefined} />
            <Points title="Try next time" items={result.tryNext} tint="bg-bubble-1" Icon={ArrowRight} index={graded ? 2 : undefined} />
          </View>
          <View className="mt-8 flex-row flex-wrap gap-3">
            <Cta label={starting ? "Setting the scene…" : "Try another"} disabled={starting} onPress={() => start(sol.id)} />
            <Cta ghost label={`Back to ${sol.name}`} onPress={() => router.replace(`/sols/${sol.id}`)} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-paper">
      <View className="px-4 pt-4"><BackLink /></View>
      <Chat
        id={`scenario-${chat.id}`} api={`/api/chats/${chat.id}/messages`} solId={sol.id} solName={sol.name}
        initialMessages={chat.messages} placeholder={`Reply to ${sol.name}`}
        header={
          <View className="mt-2 rounded-input bg-card px-4 py-3">
            <PressableScale row onPress={() => setOpen((o) => !o)} className="flex-row items-center justify-between gap-2" accessibilityRole="button" accessibilityState={{ expanded: open }}>
              <Text className="shrink text-sm font-sans-medium">{scenario.title}</Text>
              {open ? <ChevronUp size={16} color={colors.ink} /> : <ChevronDown size={16} color={colors.ink} />}
            </PressableScale>
            {open && (
              <Animated.View entering={FADE_IN} exiting={FADE_OUT}>
                <Text className="mt-1 text-sm text-ink-2">{scenario.setting}</Text>
                <Text className="mt-1 text-sm"><Text className="text-sm text-ink-2">Your goal:</Text> {scenario.goal}</Text>
              </Animated.View>
            )}
          </View>
        }
        footer={
          <View className="gap-2">
            <Cta ghost label={busy ? "Grading…" : "End scenario and see how I did"} disabled={busy} onPress={finish} />
            {gradeError && <Text className="text-sm text-ink-2">{gradeError} Try again.</Text>}
          </View>
        }
      />
    </SafeAreaView>
  );
}

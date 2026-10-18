import { useRef } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Fingerprint, LifeBuoy, MessageSquareText } from "lucide-react-native";
import { ActionCard } from "@/components/action-card";
import { BackLink } from "@/components/cta";
import { EmptyState, RecentRow } from "@/components/recent-row";
import { RankChip, ReadinessBar } from "@/components/sol-card";
import { TraitStack } from "@/components/trait-stack";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { type SolDetail } from "@/lib/api";
import { chatChip, chatLabel, isOpen, timeAgo } from "@/lib/readiness";
import { useStartScenario } from "@/lib/scenario";
import { useApi } from "@/lib/use-api";

export default function SolPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error, reload } = useApi<SolDetail>(`/api/sols/${id}`);
  const { start, busy } = useStartScenario();
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const characterY = useRef(0);
  const open = data?.scenarios.find(isOpen);
  const graded = data?.scenarios.filter((c) => c.result) ?? [];
  // Everything except the open scenario shown in the Continue card.
  const past = data?.scenarios.filter((c) => c !== open) ?? [];
  return (
    <SafeAreaView className="flex-1 bg-paper">
      <ScrollView ref={scroll} contentContainerClassName="px-4 pt-4 pb-10" keyboardShouldPersistTaps="handled">
        <BackLink />
        {error ? <EmptyState text={error} actionLabel="Retry" onPress={reload} /> : !data ? <Skeleton className="h-40 rounded-card" /> : (
          <>
            <Text className="text-ink-2">{data.sol.relationship}</Text>
            <Text className="mt-1 font-serif text-4xl">{data.sol.name}</Text>

            <View className="mt-6 gap-3 rounded-card bg-card p-5">
              <View className="flex-row items-center justify-between"><RankChip readiness={data.sol.readiness} /><Text className="text-sm text-ink-2">{graded.length} scenarios</Text></View>
              <ReadinessBar readiness={data.sol.readiness} />
            </View>

            <View className="mt-6 gap-3">
              {open
                ? <ActionCard tint={4} icon={MessageSquareText} title="Continue your scene" subtitle={open.scenario?.title ?? "Pick up where you left off"} onPress={() => router.push(`/chats/${open.id}`)} />
                : <ActionCard tint={4} icon={MessageSquareText} title="Start a scenario" subtitle="Companion sets the scene and plays them" busy={busy ? "Setting the scene…" : undefined} onPress={() => start(data.sol.id)} />}
              <ActionCard tint={3} icon={LifeBuoy} title="Ask for help" subtitle={`Coach chat about ${data.sol.name}`} href={`/sols/${id}/chat`} />
              <ActionCard tint={2} icon={Fingerprint} title="Character" subtitle={`${data.sol.traits.length} traits`} onPress={() => scroll.current?.scrollTo({ y: characterY.current, animated: true })} />
            </View>

            <View className="mt-10 gap-2">
              <Text className="mb-1 font-sans-semibold">Past scenarios</Text>
              {past.length === 0 ? <EmptyState text="No scenarios yet. Start one and Companion sets the scene." actionLabel="Start a scenario" onPress={() => start(data.sol.id)} /> : past.map((c) => (
                <RecentRow key={c.id} avatar={data.sol.name} title={chatLabel(c)} meta={timeAgo(c.createdAt)} chip={chatChip(c)} onPress={() => router.push(`/chats/${c.id}`)} />
              ))}
            </View>

            <View className="mt-10 gap-3" onLayout={(e) => (characterY.current = e.nativeEvent.layout.y)}>
              <Text className="font-sans-semibold">Character</Text>
              <TraitStack key={data.sol.updatedAt} solId={data.sol.id} traits={data.sol.traits} onSaved={reload} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

import { ActivityIndicator, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { EmptyState, RecentRow, RecentSkeleton } from "@/components/recent-row";
import { SolCard } from "@/components/sol-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { SwipeChat } from "@/components/swipe-chat";
import { chatMenu } from "@/lib/chat-menu";
import { chatLabel, timeAgo } from "@/lib/readiness";
import { useStartScenario } from "@/lib/scenario";
import { useColors } from "@/lib/theme";
import { useRecentChats } from "@/lib/use-recent";

export default function Practise() {
  const { sols: data, chats, error, refreshing, refresh, fetching } = useRecentChats();
  const colors = useColors();
  const { start, busy } = useStartScenario();
  const sols = data && [...data].sort((a, b) => (a.readiness ?? 101) - (b.readiness ?? 101));
  const graded = chats?.filter((c) => c.kind === "scenario" && c.result);
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerClassName="px-4 pt-8 pb-10" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        <Text className="mb-2 font-serif text-3xl">Practise</Text>
        <Text className="mb-8 text-ink-2">Pick someone. Companion sets a scene and plays them; you reply as yourself.</Text>

        <View className="mb-3 flex-row items-center gap-2"><Text className="font-sans-semibold">Recent results</Text>{fetching && chats && <ActivityIndicator size="small" color={colors.ink2} />}</View>
        {error && !graded ? <EmptyState text={error} actionLabel="Retry" onPress={refresh} />
          : !graded ? <RecentSkeleton />
          : graded.length === 0 ? <EmptyState text="No results yet. Pick someone below and play a scene." actionLabel={sols?.length ? "Start a scenario" : "New Sol"} onPress={sols?.length ? () => start(sols[0].id) : () => router.push("/sols/new")} />
          : <View className="gap-2">{graded.map((c) => <SwipeChat key={c.id} chat={c} onDone={refresh}><RecentRow avatar={c.sol.name} title={chatLabel(c)} meta={`${c.sol.name} · ${timeAgo(c.createdAt)}`} chip={String(c.result!.score)} onPress={() => router.push(`/chats/${c.id}`)} onLongPress={() => chatMenu(c, refresh)} /></SwipeChat>)}</View>}

        <Text className="mb-3 mt-10 font-sans-semibold">Practise with</Text>
        {!sols ? <Skeleton className="h-28 rounded-card" /> : sols.length === 0 ? <EmptyState text="Add a Sol first. A Sol is a person you want to get better at talking to." actionLabel="New Sol" onPress={() => router.push("/sols/new")} /> : (
          <View className={busy ? "gap-3 opacity-50" : "gap-3"}>{sols.map((s) => <SolCard key={s.id} sol={s} onPress={() => !busy && start(s.id)} />)}</View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

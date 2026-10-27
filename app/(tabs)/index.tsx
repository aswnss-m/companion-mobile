import { useEffect } from "react";
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { LifeBuoy, MessageSquareText, UserPlus } from "lucide-react-native";
import { ActionCard } from "@/components/action-card";
import { Mascot } from "@/components/mascot";
import { EmptyState, RecentRow, RecentSkeleton } from "@/components/recent-row";
import { SolCard } from "@/components/sol-card";
import { TraitsNudge } from "@/components/traits-nudge";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import type { Me } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { takeOnboarding } from "@/lib/onboarding";
import { chatChip, chatLabel, rankLabel, timeAgo } from "@/lib/readiness";
import { useStartScenario } from "@/lib/scenario";
import { useColors } from "@/lib/theme";
import { useApi } from "@/lib/use-api";
import { useRecentChats } from "@/lib/use-recent";

export default function Dashboard() {
  const { data: session } = authClient.useSession();
  const { sols, chats, error, refreshing, refresh, fetching } = useRecentChats();
  const colors = useColors();
  const { start, busy } = useStartScenario();
  const { data: me, reload: reloadMe } = useApi<Me>("/api/me/traits");
  useEffect(() => { if (takeOnboarding()) router.push("/me?welcome=1"); }, []);
  const next = sols && [...sols].sort((a, b) => (a.readiness ?? -1) - (b.readiness ?? -1))[0];
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerClassName="px-4 pt-8 pb-10" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { refresh(); reloadMe(); }} />}>
        <TraitsNudge missing={!!me && !me.traits} />
        <View className="flex-row items-center justify-between"><Text className="text-ink-2">Hi, {session?.user.name.split(" ")[0]}</Text><Mascot state={next ? "idle" : "happy"} height={22} /></View>
        <Text className="mt-1 font-serif text-3xl">Who&apos;s on your mind?</Text>
        <Text className="mb-8 font-serif text-3xl text-ink-2">Pick someone to practise with.</Text>

        {!sols ? <View className="gap-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-card" />)}</View> : next ? (
          <View className="gap-3">
            <ActionCard tint={4} icon={MessageSquareText} title={`Practise with ${next.name}`} subtitle={rankLabel(next.readiness)} busy={busy ? "Setting the scene…" : undefined} onPress={() => start(next.id)} />
            <ActionCard tint={3} icon={LifeBuoy} title="Ask for help" subtitle={`Coach chat about ${next.name}`} href={`/sols/${next.id}/chat`} />
            <ActionCard tint={2} icon={UserPlus} title="New Sol" subtitle="Someone you want to talk to better" href="/sols/new" />
          </View>
        ) : (
          <ActionCard tint={2} icon={UserPlus} title="Add your first Sol" subtitle="A person you want to get better at talking to" href="/sols/new" />
        )}

        <View className="mt-10">
          <View className="mb-3 flex-row items-baseline justify-between"><View className="flex-row items-center gap-2"><Text className="font-sans-semibold">Recent</Text>{fetching && chats && <ActivityIndicator size="small" color={colors.ink2} />}</View><Link href="/practise" className="font-sans text-sm text-ink-2">See all</Link></View>
          {error && !chats ? <EmptyState text={error} actionLabel="Retry" onPress={refresh} />
            : !chats ? <RecentSkeleton />
            : chats.length === 0 ? <EmptyState text="Nothing yet. Scenarios and coach chats land here." actionLabel={next ? "Start a scenario" : "New Sol"} onPress={next ? () => start(next.id) : () => router.push("/sols/new")} />
            : <View className="gap-2">{chats.slice(0, 6).map((c) => <RecentRow key={c.id} avatar={c.sol.name} title={chatLabel(c)} meta={`${c.sol.name} · ${timeAgo(c.createdAt)}`} chip={chatChip(c)} onPress={() => router.push(`/chats/${c.id}`)} />)}</View>}
        </View>

        {sols && sols.length > 0 && (
          <View className="mt-10">
            <View className="mb-3 flex-row items-baseline justify-between"><Text className="font-sans-semibold">Your Sols</Text><Link href="/sols" className="font-sans text-sm text-ink-2">See all</Link></View>
            <FlatList horizontal data={sols} keyExtractor={(s) => s.id} renderItem={({ item }) => <SolCard sol={item} />} contentContainerClassName="gap-3 pb-2" showsHorizontalScrollIndicator={false} className="-mx-4 px-4" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

import { FlatList, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { Plus } from "lucide-react-native";
import { PressableScale } from "@/components/pressable-scale";
import { EmptyState } from "@/components/recent-row";
import { SolBubble } from "@/components/sol-bubble";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { type Sol } from "@/lib/api";
import { useColors } from "@/lib/theme";
import { useApi } from "@/lib/use-api";

export default function Sols() {
  const { data: sols, error, refreshing, refresh } = useApi<Sol[]>("/api/sols");
  const colors = useColors();
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <FlatList
        data={sols ?? []}
        keyExtractor={(s) => s.id}
        renderItem={({ item, index }) => <SolBubble sol={item} index={index} />}
        contentContainerClassName="gap-3 p-4 pb-10"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        ListHeaderComponent={
          <View className="mb-4 mt-4 flex-row items-center justify-between">
            <Text className="font-serif text-4xl">Sols</Text>
            <View className="flex-row items-center gap-3">
              {sols && <Text className="text-sm text-ink-2">{sols.length} sols</Text>}
              <Link href="/sols/new" asChild><PressableScale accessibilityLabel="New Sol" className="h-10 w-10 items-center justify-center rounded-pill bg-paper-2"><Plus color={colors.ink} size={20} /></PressableScale></Link>
            </View>
          </View>
        }
        ListEmptyComponent={error ? <EmptyState text={error} actionLabel="Retry" onPress={refresh} /> : !sols ? <Skeleton className="h-24 rounded-card" /> : <EmptyState text="No one yet. Add the first person you want to talk to." actionLabel="New Sol" onPress={() => router.push("/sols/new")} />}
      />
    </SafeAreaView>
  );
}

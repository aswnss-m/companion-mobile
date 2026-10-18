import { View } from "react-native";
import { Cta } from "@/components/cta";
import { PressableScale } from "@/components/pressable-scale";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";

type Props = { avatar: string; title: string; meta: string; chip?: string; onPress: () => void };

/** design.md recent-list row: 40px initial circle, title, muted meta, chip (score / state) on the right. */
export function RecentRow({ avatar, title, meta, chip, onPress }: Props) {
  return (
    <PressableScale row onPress={onPress} className="flex-row items-center gap-3 rounded-card bg-card px-4 py-3">
      <View className="h-10 w-10 items-center justify-center rounded-pill bg-paper"><Text className="font-serif-semibold text-lg">{avatar[0]?.toUpperCase()}</Text></View>
      <View className="flex-1">
        <Text className="font-sans-medium" numberOfLines={1}>{title}</Text>
        <Text className="text-sm text-ink-2" numberOfLines={1}>{meta}</Text>
      </View>
      {chip && <View className="rounded-chip bg-[#D6875126] px-2 py-0.5"><Text className="text-xs font-sans-medium text-accent-2">{chip}</Text></View>}
    </PressableScale>
  );
}

/** Same height as RecentRow (40px avatar + py-3). */
export const RecentSkeleton = ({ rows = 3 }: { rows?: number }) => <View className="gap-2">{Array.from({ length: rows }, (_, i) => <Skeleton key={i} className="h-16 rounded-card" />)}</View>;

/** One sentence and the single next action, in the list's card style. */
export function EmptyState({ text, actionLabel, onPress }: { text: string; actionLabel?: string; onPress?: () => void }) {
  return (
    <View className="rounded-card bg-card p-5">
      <Text className="text-ink-2">{text}</Text>
      {actionLabel && <Cta ghost label={actionLabel} onPress={onPress} className="mt-4 self-start" />}
    </View>
  );
}

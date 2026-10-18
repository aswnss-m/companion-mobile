import { View } from "react-native";
import { router } from "expo-router";
import { PressableScale } from "@/components/pressable-scale";
import { Text } from "@/components/ui/text";
import type { Sol } from "@/lib/api";
import { timeAgo } from "@/lib/readiness";

export { timeAgo };

const TINTS = ["bg-bubble-1", "bg-bubble-2", "bg-bubble-3", "bg-bubble-4"];

type Props = { sol: Sol; index: number; onPress?: () => void; badge?: string | null; preview?: string; title?: string; time?: string };

/** Speech-bubble row: tint rotates by index; badge defaults to readiness, pass null for none. */
export function SolBubble({ sol, index, onPress, badge, preview, title, time }: Props) {
  const tint = TINTS[index % TINTS.length];
  const b = badge === undefined ? (sol.readiness == null ? null : String(sol.readiness)) : badge;
  return (
    <PressableScale row onPress={onPress ?? (() => router.push(`/sols/${sol.id}`))} className={`rounded-card p-4 ${tint}`}>
      <View className={`absolute -bottom-1.5 left-6 h-3.5 w-3.5 rotate-45 ${tint}`} />
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-pill bg-paper"><Text className="font-serif-semibold text-lg">{sol.name[0]?.toUpperCase()}</Text></View>
        <View className="flex-1">
          <View className="flex-row items-baseline justify-between gap-2">
            <Text className="shrink font-sans-semibold text-base" numberOfLines={1}>{title ?? sol.name}</Text>
            <Text className="text-xs text-ink-2">{time ?? timeAgo(sol.updatedAt)}</Text>
          </View>
          <Text className="text-sm text-ink-2" numberOfLines={2}>{preview ?? sol.lastMessage ?? sol.relationship}</Text>
        </View>
        {b != null && <View className="rounded-chip bg-chip/15 px-2 py-0.5"><Text className="text-xs font-sans-medium text-chip-ink">{b}</Text></View>}
      </View>
    </PressableScale>
  );
}

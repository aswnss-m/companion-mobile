import { View } from "react-native";
import { router } from "expo-router";
import { PressableScale } from "@/components/pressable-scale";
import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import type { Sol } from "@/lib/api";
import { rankLabel } from "@/lib/readiness";
import { cn } from "@/lib/utils";

export function RankChip({ readiness }: { readiness: number | null }) {
  return (
    <View className="self-start rounded-chip bg-chip/15 px-2 py-0.5">
      <Text className="text-xs font-sans-medium text-chip-ink">{rankLabel(readiness)}{readiness != null && ` · ${readiness}`}</Text>
    </View>
  );
}

export function ReadinessBar({ readiness }: { readiness: number | null }) {
  return <Progress value={readiness ?? 0} className="h-1.5 bg-paper-3" indicatorClassName="bg-accent-2" aria-label="Readiness" />;
}

export function SolCard({ sol, onPress, className }: { sol: Sol; onPress?: () => void; className?: string }) {
  return (
    <PressableScale onPress={onPress ?? (() => router.push(`/sols/${sol.id}`))} className={cn("min-w-56 rounded-card bg-card p-5", className)}>
      <View className="mb-3 flex-row items-start justify-between gap-3">
        <View className="shrink"><Text className="text-lg font-sans-semibold leading-tight">{sol.name}</Text><Text className="text-sm text-ink-2">{sol.relationship}</Text></View>
        <RankChip readiness={sol.readiness} />
      </View>
      <ReadinessBar readiness={sol.readiness} />
    </PressableScale>
  );
}

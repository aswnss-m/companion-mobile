import { View } from "react-native";
import { router, type Href } from "expo-router";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { PressableScale } from "@/components/pressable-scale";
import { Text } from "@/components/ui/text";
import { useColors } from "@/lib/theme";

const TINTS = ["bg-tint-1", "bg-tint-2", "bg-tint-3", "bg-tint-4"];

type Props = { onPress?: () => void; href?: Href; icon: LucideIcon; title: string; subtitle: string; tint: 1 | 2 | 3 | 4; busy?: string };

/** design.md action card: tinted full-width row, 40px paper icon square, title + one-line subtitle, quiet chevron. `busy` is the text shown while working. */
export function ActionCard({ onPress, href, icon: Icon, title, subtitle, tint, busy }: Props) {
  const colors = useColors();
  return (
    <PressableScale accessibilityRole="button" disabled={!!busy} onPress={href ? () => router.push(href) : onPress} className={`flex-row items-center gap-4 rounded-card p-5 ${TINTS[tint - 1]}`}>
      <View className="h-10 w-10 items-center justify-center rounded-chip bg-paper"><Icon size={20} color={colors.ink} /></View>
      <View className="flex-1">
        <Text className="font-sans-semibold">{title}</Text>
        <Text className="text-sm text-ink-2" numberOfLines={1}>{busy || subtitle}</Text>
      </View>
      <ChevronRight size={16} color={colors.ink2} />
    </PressableScale>
  );
}

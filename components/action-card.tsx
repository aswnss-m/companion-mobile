import { View } from "react-native";
import { router, type Href } from "expo-router";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { PressableScale } from "@/components/pressable-scale";
import { Text } from "@/components/ui/text";

const TINTS = ["bg-tint-1", "bg-tint-2", "bg-tint-3", "bg-tint-4"];
const INK = "#2B2520";
const INK_2 = "#70665C"; // hsl(30 10% 40%), --muted-foreground

type Props = { onPress?: () => void; href?: Href; icon: LucideIcon; title: string; subtitle: string; tint: 1 | 2 | 3 | 4; busy?: string };

/** design.md action card: tinted full-width row, 40px paper icon square, title + one-line subtitle, quiet chevron. `busy` is the text shown while working. */
export function ActionCard({ onPress, href, icon: Icon, title, subtitle, tint, busy }: Props) {
  return (
    <PressableScale accessibilityRole="button" disabled={!!busy} onPress={href ? () => router.push(href) : onPress} className={`flex-row items-center gap-4 rounded-card p-5 ${TINTS[tint - 1]}`}>
      <View className="h-10 w-10 items-center justify-center rounded-chip bg-paper"><Icon size={20} color={INK} /></View>
      <View className="flex-1">
        <Text className="font-sans-semibold">{title}</Text>
        <Text className="text-sm text-ink-2" numberOfLines={1}>{busy || subtitle}</Text>
      </View>
      <ChevronRight size={16} color={INK_2} />
    </PressableScale>
  );
}

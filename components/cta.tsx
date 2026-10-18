import type { PressableProps } from "react-native";
import { router } from "expo-router";
import { PressableScale } from "@/components/pressable-scale";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

/** design.md CTA: primary marigold pill with ink text, or ghost with hairline rule. Press feedback via PressableScale. */
export function Cta({ ghost, label, className, ...props }: Omit<PressableProps, "children" | "style"> & { ghost?: boolean; label: string; className?: string }) {
  return (
    <PressableScale accessibilityRole="button" {...props} className={cn("flex-row items-center justify-center rounded-pill px-6 py-3.5", ghost ? "border border-rule bg-transparent" : "bg-primary", className)}>
      <Text className={ghost ? "font-sans-medium text-ink" : "font-sans-medium text-primary-foreground"}>{label}</Text>
    </PressableScale>
  );
}

export function BackLink() {
  return <PressableScale row onPress={() => router.back()} hitSlop={12} className="mb-4 self-start"><Text className="text-ink-2">← Back</Text></PressableScale>;
}

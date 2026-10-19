import { View } from "react-native";
import { HandIcon } from "@/components/hand-icon";
import { PressableScale } from "@/components/pressable-scale";
import { Text } from "@/components/ui/text";

// Same layers and colours as web's .cta-glow (app/globals.css): the calm mood hue deepened to violet, as hex from its oklch values.
// shortcut: no grain on mobile, same as components/bloom.tsx.
const EDGE = "#5330A0", BODY = "#7046B6", LIGHT = "#BC97E8";
const glow = {
  backgroundImage: [
    { type: "radial-gradient", shape: "ellipse", size: { x: "70%", y: "80%" }, position: { bottom: "-30%", left: "50%" }, colorStops: [{ color: LIGHT, positions: ["0%"] }, { color: "transparent", positions: ["55%"] }] },
    { type: "radial-gradient", shape: "ellipse", size: { x: "120%", y: "140%" }, position: { top: "50%", left: "50%" }, colorStops: [{ color: BODY, positions: ["40%"] }, { color: EDGE, positions: ["100%"] }] },
  ],
  boxShadow: [
    { offsetX: 0, offsetY: 0, spreadDistance: 4, color: "rgba(208, 194, 237, 0.45)" }, // halo ring (#D0C2ED)
    { offsetX: 0, offsetY: 10, blurRadius: 20, spreadDistance: -8, color: "rgba(83, 48, 160, 0.65)" }, // glow underneath
    { inset: true, offsetX: 0, offsetY: 1, color: "rgba(255, 255, 255, 0.45)" }, // glossy top edge
    { inset: true, offsetX: 0, offsetY: -5, blurRadius: 10, color: "rgba(83, 48, 160, 0.45)" },
  ],
} as const;

/** The one "magic" action (Sol Grab): a glowing violet pill with a white label (6.5:1 on the body). */
export function GlowButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <PressableScale accessibilityRole="button" onPress={onPress} disabled={disabled} className="self-start">
      <View style={glow} className="m-1 flex-row items-center gap-1.5 rounded-pill px-4 py-2">
        <HandIcon size={14} color="white" />
        <Text className="text-sm font-sans-semibold text-white">{label}</Text>
      </View>
    </PressableScale>
  );
}

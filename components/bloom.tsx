import { StyleSheet, View } from "react-native";
import Svg, { Defs, Ellipse, RadialGradient, Stop } from "react-native-svg";
import { useColors } from "@/lib/theme";

/** design.md bloom: two soft radial stops behind a surface. shortcut: no grain on mobile (no feTurbulence in RN svg), add a noise PNG overlay if the design needs it. */
export function Bloom({ bottom }: { bottom?: boolean }) {
  const { bloomA, bloomB } = useColors();
  const [ya, yb] = bottom ? ["80%", "65%"] : ["20%", "35%"];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="a" cx="30%" cy={ya} r="60%"><Stop offset="0" stopColor={bloomA} stopOpacity={0.55} /><Stop offset="1" stopColor={bloomA} stopOpacity={0} /></RadialGradient>
          <RadialGradient id="b" cx="75%" cy={yb} r="50%"><Stop offset="0" stopColor={bloomB} stopOpacity={0.45} /><Stop offset="1" stopColor={bloomB} stopOpacity={0} /></RadialGradient>
        </Defs>
        <Ellipse cx="30%" cy={ya} rx="60%" ry="50%" fill="url(#a)" />
        <Ellipse cx="75%" cy={yb} rx="50%" ry="45%" fill="url(#b)" />
      </Svg>
    </View>
  );
}

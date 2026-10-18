import { StyleSheet, View } from "react-native";
import Svg, { Defs, Ellipse, RadialGradient, Stop } from "react-native-svg";

/** design.md bloom: two soft radial stops behind a surface. shortcut: no grain on mobile (no feTurbulence in RN svg), add a noise PNG overlay if the design needs it. */
export function Bloom() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="a" cx="30%" cy="20%" r="60%"><Stop offset="0" stopColor="#F2B48C" stopOpacity={0.55} /><Stop offset="1" stopColor="#F2B48C" stopOpacity={0} /></RadialGradient>
          <RadialGradient id="b" cx="75%" cy="35%" r="50%"><Stop offset="0" stopColor="#E7C8EC" stopOpacity={0.45} /><Stop offset="1" stopColor="#E7C8EC" stopOpacity={0} /></RadialGradient>
        </Defs>
        <Ellipse cx="30%" cy="20%" rx="60%" ry="50%" fill="url(#a)" />
        <Ellipse cx="75%" cy="35%" rx="50%" ry="45%" fill="url(#b)" />
      </Svg>
    </View>
  );
}

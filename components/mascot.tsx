import { useEffect } from "react";
import Animated, { ReduceMotion, useAnimatedProps, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import { EASE_OUT } from "@/lib/motion";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
export type MascotState = "idle" | "thinking" | "happy";
const rm = ReduceMotion.System;

/** The companion face from references/MASCOT_LOGO.md. Blink and smile run on the UI thread. */
export function Mascot({ state = "idle", height = 32, color = "#2B2520" }: { state?: MascotState; height?: number; color?: string }) {
  const r = useSharedValue(20);
  const smile = useSharedValue(state === "happy" ? 1 : 0);
  useEffect(() => {
    smile.set(withTiming(state === "happy" ? 1 : 0, { duration: 240, easing: EASE_OUT, reduceMotion: rm }));
    if (state !== "thinking") { r.set(withTiming(20, { duration: 120, reduceMotion: rm })); return; }
    r.set(withRepeat(withSequence(withDelay(1200, withTiming(3, { duration: 120, easing: EASE_OUT, reduceMotion: rm })), withTiming(20, { duration: 160, easing: EASE_OUT, reduceMotion: rm })), -1));
  }, [state, r, smile]);
  const eye = useAnimatedProps(() => ({ r: r.get() }));
  // The idle line is written as a flat quadratic so it can morph into the smile.
  const mouth = useAnimatedProps(() => { const s = smile.get(); return { d: `M 265 ${516 - 6 * s} Q 332 ${511.5 + 33.5 * s} 400 ${507 - 4 * s}` }; });
  return (
    <Svg viewBox="170 455 320 100" height={height} width={height * 3.2}>
      <AnimatedCircle cx="205" cy="506.5" animatedProps={eye} fill={color} />
      <AnimatedPath animatedProps={mouth} stroke={color} strokeWidth={20} strokeLinecap="round" fill="none" />
      <AnimatedCircle cx="460" cy="494" animatedProps={eye} fill={color} />
    </Svg>
  );
}

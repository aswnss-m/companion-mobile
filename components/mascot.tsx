import { useEffect } from "react";
import Animated, { ReduceMotion, useAnimatedProps, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import { EASE_OUT } from "@/lib/motion";
import { useColors } from "@/lib/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
export type MascotState = "idle" | "thinking" | "happy" | "sad";
const rm = ReduceMotion.System;
const t = (to: number, duration: number) => withTiming(to, { duration, easing: EASE_OUT, reduceMotion: rm });

/**
 * The companion face from references/MASCOT_LOGO.md, animated on the UI thread.
 * idle: slow blink, mouth shrinks and drifts side to side · thinking: quick blinks, mouth pulses · happy: smile, squint · sad: frown, eyes droop.
 */
export function Mascot({ state = "idle", height = 32, color: colorProp }: { state?: MascotState; height?: number; color?: string }) {
  const { ink } = useColors();
  const color = colorProp ?? ink;
  const eyeR = useSharedValue(20);        // blink = radius dip
  const eyeDrop = useSharedValue(0);      // sad droop
  const mood = useSharedValue(0);         // -1 sad · 0 flat · 1 happy (mouth curve)
  const mouthX = useSharedValue(0);       // idle drift
  const mouthW = useSharedValue(1);       // shrink / pulse

  useEffect(() => {
    mood.set(t(state === "happy" ? 1 : state === "sad" ? -1 : 0, 260));
    eyeDrop.set(t(state === "sad" ? 6 : 0, 260));
    const blink = (period: number) => withRepeat(withSequence(withDelay(period, t(2.5, 100)), t(20, 140)), -1);
    if (state === "idle") {
      eyeR.set(blink(4000));
      mouthX.set(withRepeat(withSequence(t(-4, 2000), t(4, 2000), t(0, 2000)), -1));
      mouthW.set(withRepeat(withSequence(t(0.9, 2000), t(0.95, 2000), t(1, 2000)), -1));
    } else if (state === "thinking") {
      eyeR.set(blink(1200));
      mouthX.set(t(0, 200));
      mouthW.set(withRepeat(withSequence(t(0.8, 600), t(1, 600)), -1));
    } else {
      eyeR.set(t(state === "happy" ? 15 : 18, 200));
      mouthX.set(t(0, 200));
      mouthW.set(t(1, 200));
    }
  }, [state, eyeR, eyeDrop, mood, mouthX, mouthW]);

  const leftEye = useAnimatedProps(() => ({ r: eyeR.get(), cy: 506.5 + eyeDrop.get() }));
  const rightEye = useAnimatedProps(() => ({ r: eyeR.get(), cy: 494 + eyeDrop.get() }));
  const mouth = useAnimatedProps(() => {
    const m = mood.get(), w = mouthW.get(), dx = mouthX.get();
    const half = 67.5 * w, cx = 332.5 + dx;
    // flat quadratic through the reference tilt; the control point bends it into a smile (m>0) or a frown (m<0)
    return { d: `M ${cx - half} ${516 - 6 * Math.max(m, 0) - 7 * Math.max(-m, 0)} Q ${cx} ${511.5 + 33.5 * m} ${cx + half} ${507 - 4 * Math.max(m, 0) + 9 * Math.max(-m, 0)}` };
  });
  return (
    <Svg viewBox="170 455 320 100" height={height} width={height * 3.2}>
      <AnimatedCircle cx="205" animatedProps={leftEye} fill={color} />
      <AnimatedPath animatedProps={mouth} stroke={color} strokeWidth={20} strokeLinecap="round" fill="none" />
      <AnimatedCircle cx="460" animatedProps={rightEye} fill={color} />
    </Svg>
  );
}

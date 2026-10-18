// Motion constants shared by the app (expo-animation skill: builders live at module scope).
import Animated, { cubicBezier, Easing, FadeIn, FadeInDown, FadeOut, ReduceMotion } from "react-native-reanimated";
import { cssInterop } from "nativewind";

// NativeWind only styles RN core components; register Reanimated's view once so className works on Animated.View.
cssInterop(Animated.View, { className: "style" });

export const CSS_EASE_OUT = cubicBezier(0.23, 1, 0.32, 1);
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export const FADE_IN = FadeIn.duration(200).easing(EASE_OUT).reduceMotion(ReduceMotion.System);
export const FADE_IN_DOWN = FadeInDown.duration(250).easing(EASE_OUT).reduceMotion(ReduceMotion.System);
export const FADE_OUT = FadeOut.duration(150).easing(EASE_OUT).reduceMotion(ReduceMotion.System);
export const BUBBLE_IN = FadeInDown.duration(150).easing(EASE_OUT).reduceMotion(ReduceMotion.System);
/** Staggered entrance for a short set of cards the user waited for (60ms apart). */
export const staggered = (i: number) => FadeInDown.duration(250).delay(i * 60).easing(EASE_OUT).reduceMotion(ReduceMotion.System);

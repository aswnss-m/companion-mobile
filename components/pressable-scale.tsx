import { useState } from "react";
import { Pressable, type PressableProps } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";
import { CSS_EASE_OUT } from "@/lib/motion";

type Props = Omit<PressableProps, "children" | "style"> & { children: React.ReactNode; className?: string; row?: boolean };

/** Press feedback: scale 0.97 in 120ms (buttons, cards) or an opacity dip for full-width rows. Feedback on press-in, commit on press-out. */
export function PressableScale({ children, className, row, disabled, ...props }: Props) {
  const [pressed, setPressed] = useState(false);
  const reduced = useReducedMotion();
  const dim = row || reduced;
  return (
    <Pressable hitSlop={8} pressRetentionOffset={16} {...props} disabled={disabled} onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)}>
      <Animated.View
        className={className}
        style={[
          { transitionProperty: dim ? "opacity" : "transform", transitionDuration: "120ms", transitionTimingFunction: CSS_EASE_OUT },
          pressed && (dim ? { opacity: 0.8 } : { transform: [{ scale: 0.97 }] }),
          disabled && { opacity: 0.5 },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

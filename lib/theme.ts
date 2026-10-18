import { Appearance } from "react-native";
import { colorScheme, useColorScheme } from "nativewind";
import * as SecureStore from "expo-secure-store";

/** design.md palette for props NativeWind can't reach (icons, SVG, navigator). Tokens in global.css stay the source for classes. */
export const PALETTE = {
  light: { paper: "#F7F3EA", paper2: "#EFE9DF", paper3: "#E9E2D6", ink: "#2B2520", ink2: "#766D64", rule: "#E6E0D6", bloomA: "#F2B48C", bloomB: "#E7C8EC" },
  dark: { paper: "#17161C", paper2: "#201F27", paper3: "#2A2932", ink: "#F2F0EC", ink2: "#A4A098", rule: "#33323B", bloomA: "#5B3F3F", bloomB: "#4B3F5E" },
};

export function useColors() {
  const { colorScheme: scheme } = useColorScheme();
  return PALETTE[scheme === "dark" ? "dark" : "light"];
}

export type ThemePref = "system" | "light" | "dark";
const KEY = "companion_theme";
const isPref = (v: string | null): v is ThemePref => v === "system" || v === "light" || v === "dark";

export function getThemePref(): ThemePref {
  let v: string | null = null;
  try { v = SecureStore.getItem(KEY); } catch { /* no secure store (web) or unreadable entry: follow the system */ }
  return v === "light" || v === "dark" ? v : "system";
}

export function setThemePref(p: ThemePref) {
  SecureStore.setItem(KEY, p);
  if (p === "system") Appearance.setColorScheme("unspecified" as unknown as "light"); // clear any forced style, follow the OS
  else colorScheme.set(p);
}

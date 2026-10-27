import "@/polyfills";
import "@/global.css";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import * as Sentry from "@sentry/react-native";
import { Fraunces_500Medium, Fraunces_600SemiBold } from "@expo-google-fonts/fraunces";
import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold } from "@expo-google-fonts/plus-jakarta-sans";
import { PortalHost } from "@rn-primitives/portal";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useReducedMotion } from "react-native-reanimated";
import { authClient } from "@/lib/auth-client";
import { cacheOwner } from "@/lib/cache";
import { getThemePref, useColors } from "@/lib/theme";
import { colorScheme } from "nativewind";

// No DSN (local dev) means Sentry stays off; .env.production sets it for release builds.
Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN, enabled: !!process.env.EXPO_PUBLIC_SENTRY_DSN, tracesSampleRate: 0.2 });
SplashScreen.preventAutoHideAsync();
{ const pref = getThemePref(); if (pref !== "system") colorScheme.set(pref); } // "system" needs no override on a fresh process

export default Sentry.wrap(Root);

function Root() {
  const [loaded] = useFonts({ Fraunces_500Medium, Fraunces_600SemiBold, PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold });
  const { data: session, isPending } = authClient.useSession();
  // Latch the first settle: the plugin hydrates the saved session before the network check, and later refetches
  // flip isPending back on, which must not blank the navigator.
  const [ready, setReady] = useState(false);
  if (!ready && (!isPending || session)) setReady(true);
  if (session) cacheOwner(session.user.id); // in render, not an effect: screens read the cache in their useState initializers
  const reduced = useReducedMotion();
  const colors = useColors();
  useEffect(() => { if (loaded && ready) SplashScreen.hideAsync(); }, [loaded, ready]);
  if (!loaded || !ready) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper }, animation: reduced ? "fade" : "default" }}>
        <Stack.Protected guard={!session} redirectTo="/">
          <Stack.Screen name="(auth)/sign-in" />
          <Stack.Screen name="(auth)/sign-up" />
          <Stack.Screen name="(auth)/forgot-password" />
        </Stack.Protected>
        <Stack.Protected guard={!!session} redirectTo="/sign-in">
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="sols/new" options={{ presentation: "modal" }} />
          <Stack.Screen name="sols/[id]/index" />
          <Stack.Screen name="sols/[id]/chat" />
          <Stack.Screen name="chats/[id]" />
          <Stack.Screen name="me" />
        </Stack.Protected>
      </Stack>
      <PortalHost />
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

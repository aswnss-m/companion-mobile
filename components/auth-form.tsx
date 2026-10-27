import { useState } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as Haptics from "expo-haptics";
import { FADE_IN } from "@/lib/motion";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { Bloom } from "@/components/bloom";
import { Cta } from "@/components/cta";
import { Mascot } from "@/components/mascot";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { API_URL, authClient } from "@/lib/auth-client";
import { startOnboarding } from "@/lib/onboarding";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true); setError(null);
    startOnboarding(mode === "sign-up"); // before the call: the session guard can land on Home before it resolves
    const res = mode === "sign-up" ? await authClient.signUp.email({ name, email, password, callbackURL: `${API_URL}/verified` }) : await authClient.signIn.email({ email, password });
    setBusy(false);
    if (res.error) { startOnboarding(false); setError(res.error.message ?? "Something went wrong"); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } // on success the session guard in app/_layout moves to "/"
  }

  return (
    <SafeAreaView className="flex-1 bg-paper">
      <Bloom bottom />
      <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="pb-12">
        <View className="h-52 justify-between p-6"><Mascot /><Text className="text-lg text-ink-2">Say it here first.</Text></View>
        <View className="gap-5 px-4">
          <Text className="font-serif text-3xl">{mode === "sign-up" ? "Create an account" : "Welcome back"}</Text>
          {mode === "sign-up" && <View className="gap-1.5"><Text className="text-sm font-sans-medium">Your name</Text><Input value={name} onChangeText={setName} autoComplete="name" className="rounded-input" /></View>}
          <View className="gap-1.5"><Text className="text-sm font-sans-medium">Email</Text><Input value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" className="rounded-input" /></View>
          <View className="gap-1.5"><Text className="text-sm font-sans-medium">Password</Text><Input value={password} onChangeText={setPassword} secureTextEntry autoComplete={mode === "sign-up" ? "new-password" : "current-password"} className="rounded-input" /></View>
          {mode === "sign-in" && <Link href="/forgot-password" className="-mt-3 self-start font-sans text-sm text-ink-2 underline">Forgot password?</Link>}
          {error && <Animated.View entering={FADE_IN}><Text role="alert" className="text-sm text-destructive">{error}</Text></Animated.View>}
          <Cta onPress={submit} disabled={busy || !email || password.length < 8 || (mode === "sign-up" && !name)} label={busy ? "One moment…" : mode === "sign-up" ? "Create account" : "Sign in"} />
          <Text className="text-sm text-ink-2">
            {mode === "sign-up" ? "Already have an account? " : "New here? "}
            <Link href={mode === "sign-up" ? "/sign-in" : "/sign-up"} className="text-ink underline">{mode === "sign-up" ? "Sign in" : "Create an account"}</Link>
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

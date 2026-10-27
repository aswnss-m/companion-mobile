import { useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bloom } from "@/components/bloom";
import { BackLink, Cta } from "@/components/cta";
import { Mascot } from "@/components/mascot";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { API_URL, authClient } from "@/lib/auth-client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true); setError(null);
    const res = await authClient.requestPasswordReset({ email, redirectTo: `${API_URL}/reset-password` });
    setBusy(false);
    if (res.error) setError(res.error.message ?? "Something went wrong"); else setSent(true);
  }

  return (
    <SafeAreaView className="flex-1 bg-paper">
      <Bloom bottom />
      <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="pb-12">
        <View className="h-52 justify-between p-6"><Mascot /><Text className="text-lg text-ink-2">Say it here first.</Text></View>
        <View className="gap-5 px-4">
          <BackLink />
          <Text className="font-serif text-3xl">Reset your password</Text>
          {sent ? <Text className="text-ink-2">If that email has an account, a reset link is on its way. Open it on any device.</Text> : (
            <>
              <View className="gap-1.5"><Text className="text-sm font-sans-medium">Email</Text><Input value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" className="rounded-input" /></View>
              {error && <Text role="alert" className="text-sm text-destructive">{error}</Text>}
              <Cta onPress={submit} disabled={busy || !email} label={busy ? "One moment…" : "Send reset link"} />
            </>
          )}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

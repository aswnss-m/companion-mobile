import { useState } from "react";
import { Alert, RefreshControl, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { Cta } from "@/components/cta";
import { SolGrabDialog, type Grab } from "@/components/sol-grab-dialog";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { api, type Me } from "@/lib/api";
import { API_URL, authClient } from "@/lib/auth-client";
import { clearCache } from "@/lib/cache";
import { timeAgo } from "@/lib/readiness";
import { getThemePref, setThemePref, type ThemePref } from "@/lib/theme";
import { useApi } from "@/lib/use-api";

const PREFS: { value: ThemePref; label: string }[] = [{ value: "system", label: "System" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }];

type GrabLink = Grab & { answerCount: number; createdAt: string };
const status = (g: GrabLink) =>
  g.maxAnswers === null ? `${g.answerCount} ${g.answerCount === 1 ? "answer" : "answers"} · always open`
    : g.answerCount >= g.maxAnswers ? `Full · ${g.answerCount} of ${g.maxAnswers} answered` : `${g.answerCount} of ${g.maxAnswers} answered`;

export default function You() {
  const { data: session, refetch: refetchSession } = authClient.useSession();
  const [pref, setPref] = useState(getThemePref);
  const choose = (p: ThemePref) => { setThemePref(p); setPref(p); };
  const [pw, setPw] = useState({ current: "", next: "" });
  const [busy, setBusy] = useState<"verify" | "password" | null>(null);
  // better-auth's own flows; the emails (verification, "password changed") go out from its hooks on the server
  async function resend() {
    setBusy("verify");
    const { error } = await authClient.sendVerificationEmail({ email: session!.user.email, callbackURL: `${API_URL}/verified` });
    setBusy(null);
    Alert.alert(error ? "Couldn't send the email" : "Check your inbox", error?.message ?? "Tap the link in the email to confirm your address.");
  }
  const { data: links, reload: reloadLinks, refresh: refreshLinks, refreshing } = useApi<GrabLink[]>("/api/grabs");
  const { data: me, refresh: refreshMe } = useApi<Me>("/api/me/traits");
  const onRefresh = () => { refetchSession(); refreshLinks(); refreshMe(); };
  const revoke = (g: GrabLink) => Alert.alert("Revoke this link?", "It stops working now. Sols it already made stay.", [
    { text: "Cancel", style: "cancel" },
    { text: "Revoke", style: "destructive", onPress: () => api(`/api/grabs/${g.id}`, { method: "DELETE" }).then(reloadLinks, (e: Error) => Alert.alert("Couldn't revoke that link", e.message)) },
  ]);
  async function changePassword() {
    setBusy("password");
    const { error } = await authClient.changePassword({ currentPassword: pw.current, newPassword: pw.next, revokeOtherSessions: true });
    setBusy(null);
    if (error) return Alert.alert("Couldn't change your password", error.message ?? "Try again.");
    setPw({ current: "", next: "" });
    Alert.alert("Password changed", "You're signed out on your other devices.");
  }
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <KeyboardAwareScrollView contentInsetAdjustmentBehavior="automatic" contentContainerClassName="px-4 pt-8 pb-10" keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Text className="mb-8 font-serif text-3xl">You</Text>
        <View className="rounded-card bg-card p-6">
          <Text className="text-lg font-sans-semibold">{session?.user.name}</Text>
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="text-ink-2">{session?.user.email}</Text>
            {session && !session.user.emailVerified && <View className="rounded-chip bg-chip/15 px-2 py-0.5"><Text className="text-xs font-sans-medium text-chip-ink">Unverified</Text></View>}
          </View>
          {session && !session.user.emailVerified && <Cta ghost label={busy === "verify" ? "Sending…" : "Resend verification email"} disabled={busy !== null} onPress={resend} className="mt-4 self-start px-4 py-2" />}
        </View>
        <View className="mt-4 gap-3 rounded-card bg-card p-6">
          <Text className="text-xs font-sans-semibold uppercase tracking-widest text-ink-2">Your character</Text>
          {me?.traits ? (
            <>
              {me.traits.map((t) => (
                <View key={t.id}>
                  <Text className="text-xs font-sans-semibold uppercase tracking-widest text-ink-2">{t.title}</Text>
                  <Text className="mt-1 text-sm" numberOfLines={3}>{t.body.replace(/^- /gm, "")}</Text>
                </View>
              ))}
              <Cta ghost label="View and edit" onPress={() => router.push("/me")} className="self-start px-4 py-2" />
            </>
          ) : me && (
            <>
              <Text className="text-ink-2">Companion doesn&apos;t know you yet, so scenarios and scores are written for anyone.</Text>
              <Cta label="Tell it about you" onPress={() => router.push("/me")} className="self-start px-5 py-2.5" />
            </>
          )}
        </View>
        <View className="mt-4 gap-3 rounded-card bg-card p-6">
          <Text className="text-xs font-sans-semibold uppercase tracking-widest text-ink-2">Password</Text>
          <Input value={pw.current} onChangeText={(current) => setPw((p) => ({ ...p, current }))} placeholder="Current password" secureTextEntry autoComplete="current-password" className="rounded-input" />
          <Input value={pw.next} onChangeText={(next) => setPw((p) => ({ ...p, next }))} placeholder="New password (8+ characters)" secureTextEntry autoComplete="new-password" className="rounded-input" />
          <Cta ghost label={busy === "password" ? "Changing…" : "Change password"} disabled={busy !== null || !pw.current || pw.next.length < 8} onPress={changePassword} className="self-start px-4 py-2" />
        </View>
        <View className="mt-4 gap-3 rounded-card bg-card p-6">
          <Text className="text-xs font-sans-semibold uppercase tracking-widest text-ink-2">Sol Grab links</Text>
          {links?.length === 0 && <Text className="text-ink-2">No links yet. Make one from New Sol.</Text>}
          {links?.map((g) => (
            <View key={g.id} className="gap-2 rounded-card bg-paper px-4 py-3">
              <Text className="font-sans-medium" numberOfLines={1}>{g.url.replace(/^https?:\/\//, "")}</Text>
              <Text className="text-sm text-ink-2">{status(g)} · {timeAgo(g.createdAt)}</Text>
              <View className="flex-row gap-2">
                <SolGrabDialog link={g} onChange={reloadLinks} renderTrigger={(open) => <Cta ghost label="Share" onPress={open} className="px-4 py-2" />} />
                <Cta ghost label="Revoke" onPress={() => revoke(g)} className="px-4 py-2" />
              </View>
            </View>
          ))}
        </View>
        <View className="mt-4 rounded-card bg-card p-6">
          <Text className="mb-3 text-xs font-sans-semibold uppercase tracking-widest text-ink-2">Appearance</Text>
          <View className="flex-row flex-wrap gap-2">
            {PREFS.map((p) => <Cta key={p.value} ghost label={p.label} accessibilityState={{ selected: pref === p.value }} onPress={() => choose(p.value)} className={`px-4 py-2 ${pref === p.value ? "bg-paper-3" : ""}`} />)}
          </View>
        </View>
        <Cta ghost label="Sign out" className="mt-6 self-start" onPress={() => authClient.signOut().then(clearCache)} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

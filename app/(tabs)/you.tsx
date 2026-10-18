import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Cta } from "@/components/cta";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";
import { getThemePref, setThemePref, type ThemePref } from "@/lib/theme";

const PREFS: { value: ThemePref; label: string }[] = [{ value: "system", label: "System" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }];

export default function You() {
  const { data: session } = authClient.useSession();
  const [pref, setPref] = useState(getThemePref);
  const choose = (p: ThemePref) => { setThemePref(p); setPref(p); };
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <View className="px-4 pt-8">
        <Text className="mb-8 font-serif text-3xl">You</Text>
        <View className="rounded-card bg-card p-6"><Text className="text-lg font-sans-semibold">{session?.user.name}</Text><Text className="text-ink-2">{session?.user.email}</Text></View>
        <View className="mt-4 rounded-card bg-card p-6">
          <Text className="mb-3 text-xs font-sans-semibold uppercase tracking-widest text-ink-2">Appearance</Text>
          <View className="flex-row flex-wrap gap-2">
            {PREFS.map((p) => <Cta key={p.value} ghost label={p.label} accessibilityState={{ selected: pref === p.value }} onPress={() => choose(p.value)} className={`px-4 py-2 ${pref === p.value ? "bg-paper-3" : ""}`} />)}
          </View>
        </View>
        <Cta ghost label="Sign out" className="mt-6 self-start" onPress={() => authClient.signOut()} />
      </View>
    </SafeAreaView>
  );
}

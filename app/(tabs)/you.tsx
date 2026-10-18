import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Cta } from "@/components/cta";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";

export default function You() {
  const { data: session } = authClient.useSession();
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <View className="px-4 pt-8">
        <Text className="mb-8 font-serif text-3xl">You</Text>
        <View className="rounded-card bg-card p-6"><Text className="text-lg font-sans-semibold">{session?.user.name}</Text><Text className="text-ink-2">{session?.user.email}</Text></View>
        <Cta ghost label="Sign out" className="mt-6 self-start" onPress={() => authClient.signOut()} />
      </View>
    </SafeAreaView>
  );
}

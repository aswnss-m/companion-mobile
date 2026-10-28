import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { BackLink, Cta } from "@/components/cta";
import { EmptyState } from "@/components/recent-row";
import { SolBubble, timeAgo } from "@/components/sol-bubble";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { api, type Chat, type SolDetail } from "@/lib/api";
import { SwipeChat } from "@/components/swipe-chat";
import { chatMenu } from "@/lib/chat-menu";
import { chatTitle } from "@/lib/readiness";
import { useApi } from "@/lib/use-api";

const preview = (c: Chat) => c.messages.at(-1)?.parts.find((p) => p.type === "text")?.text ?? "No messages yet";

export default function CoachHistory() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error, reload } = useApi<SolDetail>(`/api/sols/${id}`);
  const [busy, setBusy] = useState(false);
  async function newChat() {
    setBusy(true);
    try { router.push(`/chats/${(await api<Chat>(`/api/sols/${id}/chats`, { method: "POST" })).id}`); }
    catch (e) { Alert.alert("Couldn't start a chat", (e as Error).message); }
    finally { setBusy(false); }
  }
  return (
    <SafeAreaView className="flex-1 bg-paper">
      <ScrollView contentContainerClassName="px-4 pt-4 pb-10">
        <BackLink />
        <Text className="font-serif text-4xl">Ask for help</Text>
        {error && !data ? <View className="mt-6"><EmptyState text={error} actionLabel="Retry" onPress={reload} /></View> : !data ? <Skeleton className="mt-6 h-40 rounded-card" /> : (
          <>
            <Text className="mt-1 text-ink-2">Coaching for {data.sol.name}</Text>
            <Cta label={busy ? "Opening…" : "New chat"} disabled={busy} onPress={newChat} className="mt-6" />
            <View className="mt-8 gap-3">
              {data.coachChats.length === 0 && <EmptyState text={`No chats yet. Ask anything about talking to ${data.sol.name}.`} actionLabel="New chat" onPress={newChat} />}
              {data.coachChats.map((c, i) => (
                <SwipeChat key={c.id} chat={c} onDone={reload}><SolBubble sol={data.sol} index={i} badge={null} title={chatTitle(c.messages)} preview={preview(c)} time={timeAgo(c.createdAt)} onPress={() => router.push(`/chats/${c.id}`)} onLongPress={() => chatMenu(c, reload)} /></SwipeChat>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

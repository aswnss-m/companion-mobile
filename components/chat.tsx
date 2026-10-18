import { useRef, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import Animated from "react-native-reanimated";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import * as Haptics from "expo-haptics";
import { BUBBLE_IN, CSS_EASE_OUT, FADE_OUT } from "@/lib/motion";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls, type UIMessage } from "ai";
import { Cta } from "@/components/cta";
import { Markdown } from "@/components/markdown";
import { Mascot } from "@/components/mascot";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { AI_MISSING, api, apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

const PULSE = { from: { opacity: 0.25 }, "50%": { opacity: 1 }, to: { opacity: 0.25 } };
/** Three dots pulsing on the UI thread while Companion thinks (Reanimated CSS animation). */
function TypingDots() {
  return (
    <View className="h-6 flex-row items-center gap-1.5">
      {[0, 150, 300].map((delay) => (
        <Animated.View key={delay} className="h-1.5 w-1.5 rounded-pill bg-ink-2" style={{ animationName: PULSE, animationDuration: "900ms", animationDelay: `${delay}ms`, animationIterationCount: "infinite", animationTimingFunction: CSS_EASE_OUT }} />
      ))}
    </View>
  );
}

type Props = { id: string; api: string; solId: string; solName: string; initialMessages: UIMessage[]; placeholder?: string; header?: React.ReactNode; footer?: React.ReactNode };

export function Chat({ id, api: path, solId, solName, initialMessages, placeholder, header, footer }: Props) {
  const [input, setInput] = useState("");
  const list = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [mounted] = useState(initialMessages.length); // bubbles after this index animate in
  const draft = useRef(""); // last sent text, put back in the box if that send fails
  const { messages, sendMessage, regenerate, status, addToolOutput, error } = useChat({
    id,
    messages: initialMessages,
    // apiFetch is expo/fetch (native fetch buffers streams) with the session cookie attached.
    transport: new DefaultChatTransport({ api: path, fetch: ((url, init) => apiFetch(String(url), init)) as typeof fetch }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onError: () => setInput((v) => v || draft.current),
    onFinish: ({ isError }) => { if (!isError) draft.current = ""; },
  });
  const busy = status === "submitted" || status === "streaming";

  async function decide(toolCallId: string, fact: string, trait: string, add: boolean) {
    if (add) {
      try { await api(`/api/sols/${solId}/character`, { method: "POST", body: JSON.stringify({ fact, trait }) }); }
      catch { return Alert.alert("Couldn't update their character"); }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // same moment the card flips to "Added"
    }
    addToolOutput({ tool: "propose_character_fact", toolCallId, output: add ? "added" : "skipped" });
  }

  function submit() {
    if (!input.trim() || busy) return;
    draft.current = input.trim();
    sendMessage({ text: draft.current });
    setInput("");
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <View className="px-4 pb-3"><Mascot state={busy ? "thinking" : error ? "sad" : "idle"} height={28} />{header}</View>
      <ScrollView ref={list} className="flex-1" onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })} contentContainerClassName="gap-3 px-4 py-4" keyboardShouldPersistTaps="handled">
        {messages.map((m, idx) => (
          <Animated.View key={m.id} entering={idx >= mounted ? BUBBLE_IN : undefined} className={cn("max-w-[85%] rounded-card px-4 py-3", m.role === "user" ? "self-end bg-paper-3" : "self-start bg-card")}>
            {m.parts.map((part, i) => {
              if (part.type === "text") return m.role === "user" ? <Text key={i} className="leading-relaxed">{part.text}</Text> : <Markdown key={i} variant="chat">{part.text}</Markdown>;
              if (part.type !== "tool-propose_character_fact") return null;
              const { fact = "", trait = "Notes" } = (part.input as { fact?: string; trait?: string } | undefined) ?? {};
              if (part.state === "input-available")
                return (
                  <View key={part.toolCallId} className="mt-2 rounded-input bg-paper p-3">
                    <Text className="mb-2 text-sm font-sans-medium">Add this to {solName}&apos;s {trait}?</Text>
                    <Text className="mb-3 text-sm text-ink-2">{fact}</Text>
                    <View className="flex-row gap-2">
                      <Cta label="Add" onPress={() => decide(part.toolCallId, fact, trait, true)} className="px-4 py-2" />
                      <Cta ghost label="Skip" onPress={() => decide(part.toolCallId, fact, trait, false)} className="px-4 py-2" />
                    </View>
                  </View>
                );
              if (part.state === "output-available") return <Text key={part.toolCallId} className="mt-2 text-xs text-ink-2">{part.output === "added" ? "Added to their character." : "Skipped."}</Text>;
              return null;
            })}
          </Animated.View>
        ))}
        {status === "submitted" && <Animated.View entering={BUBBLE_IN} exiting={FADE_OUT} className="self-start rounded-card bg-card px-4 py-3"><TypingDots /></Animated.View>}
      </ScrollView>
      <View className="gap-3 px-4 pb-4">
        {error && (
          <View className="flex-row items-center gap-3 rounded-card bg-card px-4 py-3">
            <Text className="flex-1 text-sm">{/503|not configured/.test(error.message) ? AI_MISSING : "Companion couldn't reply."}</Text>
            {messages.at(-1)?.role !== "user" && <Cta ghost label="Retry" onPress={() => regenerate()} className="px-4 py-2" />}
          </View>
        )}
        <View className="flex-row items-end gap-2">
          <Textarea value={input} onChangeText={setInput} placeholder={placeholder ?? "Say something"} numberOfLines={3} className="min-h-12 flex-1 rounded-input border-0 bg-paper-2 shadow-none" aria-label="Message" />
          <Cta label="Send" onPress={submit} disabled={busy || !input.trim()} />
        </View>
        {footer}
      </View>
    </KeyboardAvoidingView>
  );
}

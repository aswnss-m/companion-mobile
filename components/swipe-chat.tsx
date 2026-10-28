import { View } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react-native";
import { PressableScale } from "@/components/pressable-scale";
import { Text } from "@/components/ui/text";
import type { Chat } from "@/lib/api";
import { archiveChat, deleteChat } from "@/lib/chat-menu";
import { useColors } from "@/lib/theme";

/** Swipe a chat row left to reveal Archive and Delete (delete still asks first). */
export function SwipeChat({ chat, onDone, children }: { chat: Chat; onDone: () => void; children: React.ReactNode }) {
  const colors = useColors();
  const ArchiveIcon = chat.archivedAt ? ArchiveRestore : Archive;
  return (
    <Swipeable friction={2} rightThreshold={40} overshootRight={false} renderRightActions={(_p, _t, swipe) => (
      <View className="flex-row gap-2 pl-2">
        <PressableScale accessibilityRole="button" onPress={() => { swipe.close(); archiveChat(chat, onDone); }} className="h-full w-20 items-center justify-center gap-1 rounded-card bg-card">
          <ArchiveIcon size={18} color={colors.ink} /><Text className="text-xs font-sans-medium">{chat.archivedAt ? "Restore" : "Archive"}</Text>
        </PressableScale>
        <PressableScale accessibilityRole="button" onPress={() => deleteChat(chat, onDone, () => swipe.close())} className="h-full w-20 items-center justify-center gap-1 rounded-card bg-destructive">
          <Trash2 size={18} color="white" /><Text className="text-xs font-sans-medium text-white">Delete</Text>
        </PressableScale>
      </View>
    )}>
      {children}
    </Swipeable>
  );
}

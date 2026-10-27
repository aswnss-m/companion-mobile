import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { X } from "lucide-react-native";
import { Cta } from "@/components/cta";
import { PressableScale } from "@/components/pressable-scale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Text } from "@/components/ui/text";
import { introSeen, markIntroSeen } from "@/lib/onboarding";
import { useColors } from "@/lib/theme";

let bannerClosed = false; // for this app run, like web's sessionStorage

/** Like web's components/traits-nudge.tsx: for users without their own traits, a one-time "what's new" dialog, then a
 *  banner they can close until the next launch. */
export function TraitsNudge({ missing }: { missing: boolean }) {
  const colors = useColors();
  const [, rerender] = useState(0);
  if (!missing) return null;
  const closeIntro = () => { markIntroSeen(); rerender((n) => n + 1); };
  const closeBanner = () => { bannerClosed = true; rerender((n) => n + 1); };
  const tell = () => { closeIntro(); router.push("/me"); };
  return (
    <>
      {!bannerClosed && (
        <View accessibilityRole="summary" className="mb-6 flex-row items-center gap-2 rounded-card bg-tint-2 py-3 pr-2 pl-5">
          <Pressable accessibilityRole="link" onPress={() => router.push("/me")} className="flex-1">
            <Text className="text-sm">Scenarios and scores fit better once Companion knows you. <Text className="text-sm font-sans-semibold underline">Tell it about you</Text></Text>
          </Pressable>
          <PressableScale accessibilityRole="button" accessibilityLabel="Dismiss" hitSlop={8} onPress={closeBanner} className="h-9 w-9 items-center justify-center rounded-chip"><X size={16} color={colors.ink} /></PressableScale>
        </View>
      )}
      <Dialog open={!introSeen()} onOpenChange={(open) => { if (!open) closeIntro(); }}>
        <DialogContent className="gap-5">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Companion should know you too</DialogTitle>
            <DialogDescription>Until now it only knew the people you practise with. When it knows how you talk and what you find hard, it sets scenarios you&apos;d really face and scores you as yourself. Six quick questions, or let it read one of your WhatsApp chats.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row items-center justify-end gap-2">
            <Cta ghost label="Not now" onPress={closeIntro} className="px-5 py-2.5" />
            <Cta label="Tell it about me" onPress={tell} className="px-5 py-2.5" />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

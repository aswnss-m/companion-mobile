import { NativeTabs } from "expo-router/native-tabs";
import { useColors } from "@/lib/theme";

export default function TabLayout() {
  const colors = useColors();
  return (
    <NativeTabs tintColor={colors.ink} labelStyle={{ fontFamily: "PlusJakartaSans_500Medium" }} minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="index"><NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} /><NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="sols"><NativeTabs.Trigger.Icon sf={{ default: "person.2", selected: "person.2.fill" }} /><NativeTabs.Trigger.Label>Sols</NativeTabs.Trigger.Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="practise"><NativeTabs.Trigger.Icon sf={{ default: "bubble.left", selected: "bubble.left.fill" }} /><NativeTabs.Trigger.Label>Practise</NativeTabs.Trigger.Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="you"><NativeTabs.Trigger.Icon sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }} /><NativeTabs.Trigger.Label>You</NativeTabs.Trigger.Label></NativeTabs.Trigger>
    </NativeTabs>
  );
}

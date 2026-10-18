import { Platform } from "react-native";
import structuredClone from "@ungap/structured-clone";

// AI SDK streaming needs these on iOS (see AI SDK Expo guide).
if (Platform.OS !== "web") {
  (async () => {
    const { polyfillGlobal } = await import("react-native/Libraries/Utilities/PolyfillFunctions");
    const { TextEncoderStream, TextDecoderStream } = await import("@stardazed/streams-text-encoding");
    if (!("structuredClone" in globalThis)) polyfillGlobal("structuredClone", () => structuredClone);
    polyfillGlobal("TextEncoderStream", () => TextEncoderStream);
    polyfillGlobal("TextDecoderStream", () => TextDecoderStream);
  })();
}
export {};

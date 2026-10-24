import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { strFromU8, unzipSync } from "fflate";

/** Lets the user pick a WhatsApp export (.zip or _chat.txt) and returns its text, or null if they cancel.
 *  Media inside the zip is never unpacked; the text is capped to its newest 3 MB like web's newestPart. */
export async function pickChatText(max = 3_000_000) {
  const picked = await DocumentPicker.getDocumentAsync({ type: ["application/zip", "text/plain", "public.zip-archive", "public.plain-text"], copyToCacheDirectory: true });
  if (picked.canceled) return null;
  const asset = picked.assets[0];
  const file = new File(asset.uri);
  try {
    const bytes = await file.bytes();
    let text: string;
    if (asset.name.toLowerCase().endsWith(".zip")) {
      const txts = Object.entries(unzipSync(bytes, { filter: (f) => f.name.toLowerCase().endsWith(".txt") }));
      const chat = txts.find(([n]) => n.toLowerCase().endsWith("_chat.txt")) ?? txts[0];
      if (!chat) throw new Error("There's no chat text in that zip. Export the chat again from WhatsApp.");
      text = strFromU8(chat[1]);
    } else text = strFromU8(bytes);
    if (text.length <= max) return text;
    const cut = text.slice(-max);
    return cut.slice(cut.indexOf("\n") + 1);
  } finally {
    file.delete(); // the cache copy holds the whole chat; don't leave it behind
  }
}

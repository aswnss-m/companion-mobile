import { StyleSheet, View } from "react-native";
import MarkdownDisplay, { renderRules, type RenderRules } from "react-native-markdown-display";

const sans = "PlusJakartaSans_400Regular", semibold = "PlusJakartaSans_600SemiBold";
const hairline = StyleSheet.hairlineWidth;
// design.md values: ink, ink-2, paper-3, rule.
const chat = StyleSheet.create({
  body: { color: "#2B2520", fontFamily: sans, fontSize: 16, lineHeight: 24 },
  strong: { fontFamily: semibold },
  em: { fontFamily: sans, fontStyle: "italic", color: "#766D64" },
  paragraph: { marginTop: 0, marginBottom: 8 },
  bullet_list: { marginBottom: 4 },
  ordered_list: { marginBottom: 4 },
  list_item: { marginBottom: 2 },
  code_inline: { fontFamily: "Menlo", backgroundColor: "#E9E2D6", borderRadius: 6 },
  blockquote: { backgroundColor: "transparent", borderLeftWidth: hairline, borderLeftColor: "#766D64", paddingLeft: 12, marginLeft: 0 },
  expression: { marginVertical: 2 },
});
const doc = StyleSheet.create({
  ...chat,
  heading2: { fontFamily: semibold, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "#766D64", marginTop: 16, marginBottom: 8, paddingBottom: 4, borderBottomWidth: hairline, borderBottomColor: "#E6E0D6" },
});

const rules: RenderRules = {
  // A paragraph that is only an *expression* becomes its own muted block.
  paragraph: (node, children, parent, styles) => {
    const inline = node.children[0]?.type === "textgroup" ? node.children[0].children : node.children;
    if (node.children.length === 1 && inline.length === 1 && inline[0].type === "em") return <View key={node.key} style={chat.expression}>{children}</View>;
    return renderRules.paragraph!(node, children, parent, styles);
  },
};
const docRules: RenderRules = { ...rules, heading1: () => null };

export function Markdown({ children, variant }: { children: string; variant: "chat" | "doc" }) {
  return <MarkdownDisplay style={variant === "doc" ? doc : chat} rules={variant === "doc" ? docRules : rules}>{children}</MarkdownDisplay>;
}

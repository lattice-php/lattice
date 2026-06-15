import { createPlugin } from "@lattice-php/lattice/core/registry";
import { TextPart } from "./parts/text";
import { ToolCallPart } from "./parts/tool-call";

export const chatPlugin = createPlugin({
  name: "chat",
  chatParts: { text: TextPart, "tool-call": ToolCallPart },
});

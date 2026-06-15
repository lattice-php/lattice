import { createPlugin, eagerComponent } from "@lattice-php/lattice/core/registry";
import { TextPart } from "./parts/text";
import { ToolCallPart } from "./parts/tool-call";

export const chatPlugin = createPlugin({
  name: "chat",
  components: {
    "chat.part.text": eagerComponent(TextPart),
    "chat.part.tool-call": eagerComponent(ToolCallPart),
  },
});

import { createPlugin, eagerComponent } from "@lattice-php/lattice/core/registry";
import ChatBoxComponent from "./components/chat-box";
import { TextPart } from "./parts/text";
import { ToolCallPart } from "./parts/tool-call";

export const chatPlugin = createPlugin({
  name: "chat",
  components: {
    "chat.box": eagerComponent(ChatBoxComponent),
    "chat.part.text": eagerComponent(TextPart),
    "chat.part.tool-call": eagerComponent(ToolCallPart),
  },
});

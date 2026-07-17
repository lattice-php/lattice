import {
  createPlugin,
  eagerComponent,
  type ComponentRegistryFor,
} from "@lattice-php/lattice/core/registry";
import ChatBoxComponent from "./components/chat-box";
import { TextPart } from "./parts/text";
import type { ChatNodeType } from "@lattice-php/lattice/types/generated";
import { ToolCallPart } from "./parts/tool-call";

export const chatComponents = createPlugin({
  name: "lattice/chat",
  components: {
    "chat.box": eagerComponent(ChatBoxComponent),
    "chat.part.text": eagerComponent(TextPart),
    "chat.part.tool-call": eagerComponent(ToolCallPart),
  } satisfies ComponentRegistryFor<ChatNodeType>,
});

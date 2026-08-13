import { lazyComponent, type ComponentRegistryFor, type Plugin } from "@lattice-php/core/registry";
import type { ChatNodeType } from "./generated";

export default {
  name: "lattice/chat",
  components: {
    "chat.box": lazyComponent(() => import("./components/chat-box")),
    "chat.part.text": lazyComponent(() => import("./parts/text")),
    "chat.part.tool-call": lazyComponent(() => import("./parts/tool-call")),
  } satisfies ComponentRegistryFor<ChatNodeType>,
  i18n: {
    namespace: "chat",
  },
} satisfies Plugin;

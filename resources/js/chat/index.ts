import { createPlugin } from "@lattice-php/lattice/core/registry";
import { TextPart } from "./parts/text";

export const chatPlugin = createPlugin({
  name: "chat",
  chatParts: { text: TextPart },
});

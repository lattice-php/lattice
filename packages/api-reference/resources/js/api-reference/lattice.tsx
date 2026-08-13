// Side-effect import: loads the ComponentProps augmentation in programs whose
// tsconfig include misses types.ts (the docs app), so node.props stays typed.
import "../types";
import type { RendererComponent } from "@lattice-php/core";
import { ApiReference } from "./ApiReference";

const ApiReferenceNode: RendererComponent<"api-reference"> = ({ node }) => (
  <ApiReference {...node.props} />
);

export default ApiReferenceNode;

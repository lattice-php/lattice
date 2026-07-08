import { lazy, Suspense } from "react";
import type { RendererComponent, RendererComponentModule } from "@lattice-php/lattice/core/types";

const RichEditorField = lazy(
  () => import("./rich-editor-field") as unknown as Promise<RendererComponentModule>,
);

export const RichEditorComponent: RendererComponent<"field.rich-editor"> = ({ children, node }) => (
  <Suspense fallback={null}>
    <RichEditorField node={node}>{children}</RichEditorField>
  </Suspense>
);

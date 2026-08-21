import { lazy, Suspense } from "react";
import type { RendererComponent, RendererComponentModule } from "@lattice-php/core";

const RichEditorField = lazy(
  () => import("./rich-editor-view") as unknown as Promise<RendererComponentModule>,
);

export const RichEditorAdapter: RendererComponent<"field.rich-editor"> = ({ children, node }) => (
  <Suspense fallback={null}>
    <RichEditorField node={node}>{children}</RichEditorField>
  </Suspense>
);

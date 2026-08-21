import { lazy, Suspense } from "react";
import type { RendererComponent, RendererComponentModule } from "@lattice-php/core";

const PatternInputField = lazy(
  () => import("./pattern-input-view") as unknown as Promise<RendererComponentModule>,
);

export const PatternInputAdapter: RendererComponent<"field.pattern-input"> = ({
  children,
  node,
}) => (
  <Suspense fallback={null}>
    <PatternInputField node={node}>{children}</PatternInputField>
  </Suspense>
);

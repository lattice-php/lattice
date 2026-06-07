import type { ReactNode } from "react";
import type { LatticeComponentRegistry } from "@/lattice/core/registry";
import { LatticeRenderer as CoreLatticeRenderer } from "@/lattice/core/renderer";
import type {
  LatticeNode,
  LatticeRendererComponent,
  LatticeUnknownComponent,
} from "@/lattice/core/types";
import { latticeRegistry } from "@/lattice/registry";

export function LatticeRenderer({
  registry = latticeRegistry,
  ...props
}: {
  fallback?: ReactNode;
  missingComponent?: LatticeUnknownComponent;
  nodes: LatticeNode[];
  registry?: LatticeComponentRegistry;
}) {
  return <CoreLatticeRenderer registry={registry} {...props} />;
}

export { latticeRegistry };
export type { LatticeRendererComponent };

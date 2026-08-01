import type { CSSProperties } from "react";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { RenderNode } from "@lattice-php/lattice/core/renderer";
import { nodeKey } from "@lattice-php/lattice/core/nodes";
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";

type BreakpointMap = Record<string, number | string>;

function breakpointVars(
  map: BreakpointMap | null | undefined,
  prefix: string,
  toValue: (value: number | string) => string,
): CSSProperties | undefined {
  const entries = Object.entries(map ?? {});

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(
    entries.map(([breakpoint, value]) => [`${prefix}-${breakpoint}`, toValue(value)]),
  ) as CSSProperties;
}

const trackList = (value: number | string): string =>
  typeof value === "number" ? `repeat(${value}, minmax(0, 1fr))` : value;

const gridColumn = (value: number | string): string =>
  value === "full" ? "1 / -1" : `span ${value} / span ${value}`;

const GridComponent: RendererComponent<"grid"> = ({ node }) => {
  return (
    <div
      data-slot="grid"
      data-lattice-component={nodeIdentity(node)}
      className="lt-grid grid gap-x-4 gap-y-6"
      style={breakpointVars(node.props.columns, "--lt-grid-cols", trackList)}
    >
      {(node.schema ?? []).map((child, index) => (
        <div
          key={nodeKey(child, index)}
          data-slot="grid-item"
          style={breakpointVars(
            child.props?.columnSpan as BreakpointMap | undefined,
            "--lt-col-span",
            gridColumn,
          )}
        >
          <RenderNode node={child} />
        </div>
      ))}
    </div>
  );
};

export default GridComponent;

import { RenderNode } from "@lattice-php/core/renderer";
import { nodeKey } from "@lattice-php/core/nodes";
import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { Grid, GridItem } from "./grid";
import type { GridBreakpointMap } from "./grid";

export const GridAdapter: RendererComponent<"grid"> = ({ node }) => (
  <Grid
    columns={(node.props.columns ?? undefined) as GridBreakpointMap | undefined}
    data-test={nodeIdentity(node)}
  >
    {(node.schema ?? []).map((child, index) => (
      <GridItem
        key={nodeKey(child, index)}
        columnSpan={child.props?.columnSpan as GridBreakpointMap | undefined}
      >
        <RenderNode node={child} />
      </GridItem>
    ))}
  </Grid>
);

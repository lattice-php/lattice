import { lazy, Suspense } from "react";
import type { RendererComponent, RendererComponentModule } from "@lattice-php/core/types";

const ChartView = lazy(() => import("./chart-view") as unknown as Promise<RendererComponentModule>);

const ChartAdapter: RendererComponent<"chart"> = ({ children, node }) => (
  <Suspense fallback={null}>
    <ChartView node={node}>{children}</ChartView>
  </Suspense>
);

export default ChartAdapter;

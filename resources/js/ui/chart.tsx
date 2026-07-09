import { lazy, Suspense } from "react";
import type { RendererComponent, RendererComponentModule } from "@lattice-php/lattice/core/types";

const ChartView = lazy(() => import("./chart-view") as unknown as Promise<RendererComponentModule>);

const ChartComponent: RendererComponent<"chart"> = ({ children, node }) => (
  <Suspense fallback={null}>
    <ChartView node={node}>{children}</ChartView>
  </Suspense>
);

export default ChartComponent;

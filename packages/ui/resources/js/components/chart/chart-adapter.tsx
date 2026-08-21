import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { Chart } from "./chart";

export const ChartAdapter: RendererComponent<"chart"> = ({ node }) => (
  <Chart
    categoryFormat={node.props.categoryFormat}
    categoryKey={node.props.categoryKey}
    data={node.props.data}
    data-test={nodeIdentity(node)}
    description={node.props.description}
    grid={node.props.grid}
    height={node.props.height}
    legend={node.props.legend}
    series={node.props.series}
    title={node.props.title}
    tooltip={node.props.tooltip}
    valueFormat={node.props.valueFormat}
    xAxis={node.props.xAxis}
    yAxis={node.props.yAxis}
  />
);

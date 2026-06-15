import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ComponentType, ReactNode } from "react";
import type { PropsOf, RendererComponent } from "@lattice-php/lattice/core/types";

type ChartProps = PropsOf<"chart">;
type ChartSeries = ChartProps["series"][number];
type ChartDatum = ChartProps["data"][number];
type CartesianSeries = ChartSeries & { type: "area" | "bar" | "line" };

const palette = [
  "var(--lt-primary)",
  "var(--lt-success)",
  "var(--lt-info)",
  "var(--lt-warning)",
  "var(--lt-danger)",
  "var(--lt-muted-fg)",
];

function colorAt(index: number): string {
  return palette[index % palette.length] ?? "var(--lt-primary)";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function datumColor(datum: ChartDatum, series: ChartSeries, index: number): string {
  if (isRecord(datum) && typeof datum.color === "string") {
    return datum.color;
  }

  return series.color ?? colorAt(index);
}

function isCartesianSeries(series: ChartSeries): series is CartesianSeries {
  return series.type === "area" || series.type === "bar" || series.type === "line";
}

function cartesianChartFor(
  series: CartesianSeries[],
): ComponentType<{ children: ReactNode; data: ChartProps["data"] }> {
  const types = new Set(series.map((item) => item.type));

  if (types.size !== 1) {
    return ComposedChart;
  }

  switch (series[0]?.type) {
    case "area":
      return AreaChart;
    case "bar":
      return BarChart;
    case "line":
      return LineChart;
    default:
      return ComposedChart;
  }
}

function ChartFrame({
  children,
  description,
  id,
  title,
}: {
  children: ReactNode;
  description: string | null;
  id?: string;
  title: string | null;
}) {
  const hasHeader = title !== null || description !== null;

  return (
    <div
      className="flex flex-col gap-4 rounded-lt border border-lt-border bg-lt-surface p-6 text-lt-surface-fg shadow-xs"
      data-lattice-component={id}
    >
      {hasHeader && (
        <div className="flex min-w-0 flex-col gap-1.5">
          {title !== null && <div className="font-semibold leading-none">{title}</div>}
          {description !== null && <div className="text-sm text-lt-muted-fg">{description}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

function CartesianChart({ props }: { props: ChartProps }) {
  const series = props.series.filter(isCartesianSeries);
  const RechartsChart = cartesianChartFor(series);

  return (
    <ResponsiveContainer width="100%" height={props.height}>
      <RechartsChart data={props.data}>
        {props.grid && <CartesianGrid strokeDasharray="3 3" stroke="var(--lt-border)" />}
        {props.xAxis && props.categoryKey !== null && (
          <XAxis dataKey={props.categoryKey} stroke="var(--lt-muted-fg)" tickLine={false} />
        )}
        {props.yAxis && <YAxis stroke="var(--lt-muted-fg)" tickLine={false} width={40} />}
        {props.tooltip && <Tooltip />}
        {props.legend && <Legend />}
        {series.map((item, index) => {
          const color = item.color ?? colorAt(index);
          const key = `${item.type}:${item.dataKey}`;

          if (item.type === "area") {
            return (
              <Area
                key={key}
                dataKey={item.dataKey}
                fill={color}
                fillOpacity={0.16}
                name={item.name ?? undefined}
                stackId={item.stackId ?? undefined}
                stroke={color}
                type="monotone"
              />
            );
          }

          if (item.type === "bar") {
            return (
              <Bar
                key={key}
                dataKey={item.dataKey}
                fill={color}
                name={item.name ?? undefined}
                radius={[4, 4, 0, 0]}
                stackId={item.stackId ?? undefined}
              />
            );
          }

          return (
            <Line
              key={key}
              dataKey={item.dataKey}
              dot={false}
              name={item.name ?? undefined}
              stroke={color}
              strokeWidth={2}
              type="monotone"
            />
          );
        })}
      </RechartsChart>
    </ResponsiveContainer>
  );
}

function PieChartView({ props, series }: { props: ChartProps; series: ChartSeries }) {
  return (
    <ResponsiveContainer width="100%" height={props.height}>
      <PieChart>
        {props.tooltip && <Tooltip />}
        {props.legend && <Legend />}
        <Pie
          data={props.data}
          dataKey={series.dataKey}
          name={series.name ?? undefined}
          nameKey={series.nameKey ?? undefined}
          outerRadius="80%"
        >
          {props.data.map((datum, index) => (
            <Cell key={index} fill={datumColor(datum, series, index)} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

const ChartComponent: RendererComponent<"chart"> = ({ node }) => {
  const props = node.props;
  const pieSeries = props.series.find((series) => series.type === "pie");
  const hasCartesianSeries = props.series.some(isCartesianSeries);

  return (
    <ChartFrame description={props.description} id={node.id} title={props.title}>
      <div className="min-h-0 w-full">
        {pieSeries && !hasCartesianSeries ? (
          <PieChartView props={props} series={pieSeries} />
        ) : (
          <CartesianChart props={props} />
        )}
      </div>
    </ChartFrame>
  );
};

export default ChartComponent;

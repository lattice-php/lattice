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
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";
import type { PropsOf, RendererComponent } from "@lattice-php/lattice/core/types";
import { useLocale, useTimezone } from "@lattice-php/lattice/i18n";
import { formatValue } from "../format/value";

type ChartProps = PropsOf<"chart">;
type ChartSeries = ChartProps["series"][number];
type ChartDatum = ChartProps["data"][number];
type CartesianSeries = ChartSeries & { type: "area" | "bar" | "line" };
type ChartMargin = { bottom: number; left: number; right: number; top: number };
type CartesianChartComponent = ComponentType<{
  children: ReactNode;
  data: ChartProps["data"];
  margin?: ChartMargin;
}>;

const chartMargin: ChartMargin = { bottom: 0, left: 0, right: 16, top: 8 };
const compactLegendProps = {
  align: "center" as const,
  height: 24,
  iconSize: 7,
  verticalAlign: "top" as const,
  wrapperStyle: { fontSize: 11, lineHeight: "14px", paddingBottom: 6 },
};
const axisTick = { fontSize: 10 };
const tooltipProps = {
  contentStyle: {
    background: "var(--lt-surface)",
    border: "1px solid var(--lt-border)",
    borderRadius: "var(--lt-radius-sm)",
    boxShadow: "var(--lt-shadow-sm)",
    color: "var(--lt-surface-fg)",
    fontSize: 12,
  },
  itemStyle: { color: "var(--lt-surface-fg)" },
  labelStyle: { color: "var(--lt-muted-fg)" },
} as const;

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

function cartesianChartFor(series: CartesianSeries[]): CartesianChartComponent {
  const types = new Set(series.map((item) => item.type));
  const firstSeries = series[0];

  if (firstSeries === undefined || types.size !== 1) {
    return ComposedChart;
  }

  switch (firstSeries.type) {
    case "area":
      return AreaChart;
    case "bar":
      return BarChart;
    case "line":
      return LineChart;
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
      className="flex flex-col gap-3 rounded-lt border border-lt-border bg-lt-surface p-4 text-lt-surface-fg shadow-lt-sm"
      data-lattice-component={id}
    >
      {hasHeader && (
        <div className="flex min-w-0 flex-col gap-1.5">
          {title !== null && <div className="text-sm font-semibold leading-tight">{title}</div>}
          {description !== null && (
            <div className="text-xs leading-5 text-lt-muted-fg">{description}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function CartesianChart({ props }: { props: ChartProps }) {
  const series = props.series.filter(isCartesianSeries);
  const RechartsChart = cartesianChartFor(series);
  const { locale } = useLocale();
  const { timezone } = useTimezone();
  const ctx = { locale, timezone };
  const formatCategory = (value: unknown) => formatValue(value, props.categoryFormat, ctx);
  const formatValueTick = (value: unknown) => formatValue(value, props.valueFormat, ctx);
  const hasBarSeries = series.some((item) => item.type === "bar");
  const tooltipCursor = hasBarSeries
    ? { fill: "var(--lt-muted-fg)", fillOpacity: 0.15 }
    : { stroke: "var(--lt-muted-fg)", strokeOpacity: 0.4 };

  return (
    <ResponsiveContainer width="100%" height={props.height} debounce={100}>
      <RechartsChart data={props.data} margin={chartMargin}>
        {props.grid && <CartesianGrid strokeDasharray="3 3" stroke="var(--lt-border)" />}
        {props.xAxis && props.categoryKey !== null && (
          <XAxis
            dataKey={props.categoryKey}
            stroke="var(--lt-muted-fg)"
            tick={axisTick}
            tickFormatter={formatCategory}
            tickLine={false}
          />
        )}
        {props.yAxis && (
          <YAxis
            stroke="var(--lt-muted-fg)"
            tick={axisTick}
            tickFormatter={formatValueTick}
            tickLine={false}
            width={42}
          />
        )}
        {props.tooltip && (
          <Tooltip
            {...tooltipProps}
            cursor={tooltipCursor}
            formatter={formatValueTick}
            labelFormatter={formatCategory}
          />
        )}
        {props.legend && <Legend {...compactLegendProps} />}
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
  const { locale } = useLocale();
  const { timezone } = useTimezone();
  const ctx = { locale, timezone };

  return (
    <ResponsiveContainer width="100%" height={props.height} debounce={100}>
      <PieChart margin={chartMargin}>
        {props.tooltip && (
          <Tooltip
            {...tooltipProps}
            formatter={(value) => formatValue(value, props.valueFormat, ctx)}
            labelFormatter={(value) => formatValue(value, props.categoryFormat, ctx)}
          />
        )}
        {props.legend && <Legend {...compactLegendProps} />}
        <Pie
          data={props.data}
          dataKey={series.dataKey}
          name={series.name ?? undefined}
          nameKey={series.nameKey ?? undefined}
          outerRadius="68%"
        >
          {props.data.map((datum, index) => (
            <Cell key={index} fill={datumColor(datum, series, index)} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

const ChartView: RendererComponent<"chart"> = ({ node }) => {
  const props = node.props;
  const pieSeries = props.series.find((series) => series.type === "pie");
  const hasCartesianSeries = props.series.some(isCartesianSeries);

  return (
    <ChartFrame description={props.description} id={nodeIdentity(node)} title={props.title}>
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

export default ChartView;

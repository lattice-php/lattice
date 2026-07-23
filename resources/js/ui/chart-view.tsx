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
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ComponentType, ReactNode } from "react";
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";
import { isRecord } from "@lattice-php/lattice/core/materialize";
import type { ComponentPropsOf, RendererComponent } from "@lattice-php/lattice/core/types";
import { coerceColor, colorValue } from "@lattice-php/lattice/lib/color";
import { useFormatContext } from "@lattice-php/lattice/format/format-context";
import { numericValue } from "@lattice-php/lattice/format/numeric";
import { formatValue } from "@lattice-php/lattice/format/value";

type ChartProps = ComponentPropsOf<"chart">;
type ChartSeries = ChartProps["series"][number];
type ChartDatum = ChartProps["data"][number];
type CartesianSeries = ChartSeries & { type: "area" | "bar" | "line" };
type SpecialSeries = ChartSeries & { type: "distribution" | "gauge" | "pie" };
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
  "var(--lt-chart-1)",
  "var(--lt-chart-2)",
  "var(--lt-chart-3)",
  "var(--lt-chart-4)",
  "var(--lt-chart-5)",
  "var(--lt-chart-6)",
  "var(--lt-chart-7)",
  "var(--lt-chart-8)",
];

export function colorAt(index: number): string {
  return palette[index % palette.length] ?? "var(--lt-chart-1)";
}

function datumColor(datum: ChartDatum, series: ChartSeries, index: number): string {
  if (isRecord(datum)) {
    const color = coerceColor(datum.color);

    if (color) {
      return colorValue(color);
    }
  }

  return series.color ? colorValue(series.color) : colorAt(index);
}

function isCartesianSeries(series: ChartSeries): series is CartesianSeries {
  return series.type === "area" || series.type === "bar" || series.type === "line";
}

function isSpecialSeries(series: ChartSeries): series is SpecialSeries {
  return !isCartesianSeries(series);
}

function datumValue(datum: ChartDatum, key: string): number {
  return isRecord(datum) ? (numericValue(datum[key]) ?? 0) : 0;
}

function datumName(datum: ChartDatum, series: ChartSeries): string {
  if (series.nameKey === null || !isRecord(datum)) {
    return series.name;
  }

  const name = datum[series.nameKey];

  return typeof name === "string" ? name : series.name;
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
  const ctx = useFormatContext();
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
          const color = item.color ? colorValue(item.color) : colorAt(index);
          const key = `${item.type}:${item.dataKey}`;

          if (item.type === "area") {
            return (
              <Area
                key={key}
                dataKey={item.dataKey}
                fill={color}
                fillOpacity={0.16}
                name={item.name}
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
                name={item.name}
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
              name={item.name}
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
  const ctx = useFormatContext();

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
          name={series.name}
          nameKey={series.nameKey ?? undefined}
          innerRadius={series.innerRadius}
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

function ChartLegend({
  entries,
}: {
  entries: Array<{ color: string; label: string; value?: string }>;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
      {entries.map((entry, index) => (
        <span
          key={index}
          className="flex items-center gap-1 text-[11px] leading-[14px] text-lt-muted-fg"
        >
          <span
            aria-hidden
            className="size-[7px] rounded-full"
            style={{ background: entry.color }}
          />
          {entry.label}
          {entry.value !== undefined && (
            <span className="font-medium text-lt-surface-fg">{entry.value}</span>
          )}
        </span>
      ))}
    </div>
  );
}

function GaugeChartView({ props, series }: { props: ChartProps; series: ChartSeries }) {
  const ctx = useFormatContext();
  const values = props.data.map((datum) => datumValue(datum, series.dataKey));
  const max = series.maxValue ?? Math.max(0, ...values);
  const legendEntries = props.data.map((datum, index) => ({
    color: datumColor(datum, series, index),
    label: datumName(datum, series),
  }));

  return (
    <div className="flex flex-col gap-1.5">
      {props.legend && <ChartLegend entries={legendEntries} />}
      <div className="relative">
        <ResponsiveContainer width="100%" height={props.height} debounce={100}>
          <RadialBarChart
            data={props.data}
            endAngle={-30}
            innerRadius={series.innerRadius}
            margin={chartMargin}
            outerRadius="100%"
            startAngle={210}
          >
            <PolarAngleAxis type="number" domain={[0, max]} tick={false} />
            {props.tooltip && (
              <Tooltip
                {...tooltipProps}
                formatter={(value) => formatValue(value, props.valueFormat, ctx)}
              />
            )}
            <RadialBar
              background={{ fill: "var(--lt-muted)" }}
              cornerRadius={6}
              dataKey={series.dataKey}
              name={series.name}
            >
              {props.data.map((datum, index) => (
                <Cell key={index} fill={datumColor(datum, series, index)} />
              ))}
            </RadialBar>
          </RadialBarChart>
        </ResponsiveContainer>
        {values.length === 1 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-semibold text-lt-surface-fg">
              {formatValue(values[0], props.valueFormat, ctx)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function DistributionChartView({ props, series }: { props: ChartProps; series: ChartSeries }) {
  const ctx = useFormatContext();
  const segments = props.data
    .map((datum, index) => ({
      color: datumColor(datum, series, index),
      label: datumName(datum, series),
      value: datumValue(datum, series.dataKey),
    }))
    .filter((segment) => segment.value > 0);
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  if (total <= 0) {
    return <div className="h-2.5 w-full rounded-full bg-lt-muted" data-lattice-distribution="" />;
  }

  const formatPercent = new Intl.NumberFormat(ctx.locale, {
    maximumFractionDigits: 1,
    style: "percent",
  });

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full"
        data-lattice-distribution=""
      >
        {segments.map((segment, index) => (
          <div
            key={index}
            style={{ background: segment.color, width: `${(segment.value / total) * 100}%` }}
            title={
              props.tooltip
                ? `${segment.label}: ${formatValue(segment.value, props.valueFormat, ctx)}`
                : undefined
            }
          />
        ))}
      </div>
      {props.legend && (
        <ChartLegend
          entries={segments.map((segment) => ({
            color: segment.color,
            label: segment.label,
            value: formatPercent.format(segment.value / total),
          }))}
        />
      )}
    </div>
  );
}

function SpecialChart({ props, series }: { props: ChartProps; series: SpecialSeries }) {
  switch (series.type) {
    case "distribution":
      return <DistributionChartView props={props} series={series} />;
    case "gauge":
      return <GaugeChartView props={props} series={series} />;
    case "pie":
      return <PieChartView props={props} series={series} />;
  }
}

const ChartView: RendererComponent<"chart"> = ({ node }) => {
  const props = node.props;
  const specialSeries = props.series.find(isSpecialSeries);
  const hasCartesianSeries = props.series.some(isCartesianSeries);

  return (
    <ChartFrame description={props.description} id={nodeIdentity(node)} title={props.title}>
      <div className="min-h-0 w-full">
        {specialSeries !== undefined && !hasCartesianSeries ? (
          <SpecialChart props={props} series={specialSeries} />
        ) : (
          <CartesianChart props={props} />
        )}
      </div>
    </ChartFrame>
  );
};

export default ChartView;

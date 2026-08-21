import { lazy, Suspense } from "react";
import type { ComponentProps } from "react";
import type { ChartSeries, DateFormat, NumberFormat } from "../../generated";
import { cn } from "../../lib/utils";

const ChartView = lazy(() => import("./chart-view"));

export type ChartProps = Omit<ComponentProps<"div">, "title"> & {
  categoryFormat?: DateFormat | NumberFormat | null;
  categoryKey?: string | null;
  data: Record<string, unknown>[];
  description?: string | null;
  grid?: boolean;
  height?: number;
  legend?: boolean;
  series: ChartSeries[];
  title?: string | null;
  tooltip?: boolean;
  valueFormat?: NumberFormat | null;
  xAxis?: boolean;
  yAxis?: boolean;
};

export type ChartViewProps = {
  categoryFormat: DateFormat | NumberFormat | null;
  categoryKey: string | null;
  data: Record<string, unknown>[];
  grid: boolean;
  height: number;
  legend: boolean;
  series: ChartSeries[];
  tooltip: boolean;
  valueFormat: NumberFormat | null;
  xAxis: boolean;
  yAxis: boolean;
};

export function Chart({
  categoryFormat = null,
  categoryKey = null,
  className,
  data,
  description = null,
  grid = true,
  height = 320,
  legend = true,
  series,
  title = null,
  tooltip = true,
  valueFormat = null,
  xAxis = true,
  yAxis = true,
  ...props
}: ChartProps) {
  const hasHeader = title !== null || description !== null;

  return (
    <div
      {...props}
      className={cn(
        "flex flex-col gap-3 rounded-lt border border-lt-border bg-lt-surface p-4 text-lt-surface-fg shadow-lt-sm",
        className,
      )}
    >
      {hasHeader && (
        <div className="flex min-w-0 flex-col gap-1.5">
          {title !== null && <div className="text-sm font-semibold leading-tight">{title}</div>}
          {description !== null && (
            <div className="text-xs leading-5 text-lt-muted-fg">{description}</div>
          )}
        </div>
      )}
      <div className="min-h-0 w-full">
        <Suspense fallback={<div style={{ height }} />}>
          <ChartView
            categoryFormat={categoryFormat}
            categoryKey={categoryKey}
            data={data}
            grid={grid}
            height={height}
            legend={legend}
            series={series}
            tooltip={tooltip}
            valueFormat={valueFormat}
            xAxis={xAxis}
            yAxis={yAxis}
          />
        </Suspense>
      </div>
    </div>
  );
}

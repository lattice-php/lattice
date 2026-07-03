import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import ChartComponent from "./chart";

vi.mock("recharts", async () => {
  const React = await import("react");
  const h = React.createElement;
  const seriesAttrs = (testId: string, props: Record<string, unknown>) => ({
    "data-key": String(props.dataKey),
    "data-name": props.name === undefined ? undefined : String(props.name),
    "data-stack": props.stackId === undefined ? undefined : String(props.stackId),
    "data-test": testId,
    fill: props.fill === undefined ? undefined : String(props.fill),
    stroke: props.stroke === undefined ? undefined : String(props.stroke),
  });

  return {
    Area: (props: Record<string, unknown>) => h("div", seriesAttrs("series-area", props)),
    AreaChart: ({ children }: { children: React.ReactNode }) =>
      h("div", { "data-test": "area-chart" }, children),
    Bar: (props: Record<string, unknown>) => h("div", seriesAttrs("series-bar", props)),
    BarChart: ({ children }: { children: React.ReactNode }) =>
      h("div", { "data-test": "bar-chart" }, children),
    CartesianGrid: (props: Record<string, unknown>) =>
      h("div", { "data-test": "cartesian-grid", stroke: String(props.stroke) }),
    Cell: (props: Record<string, unknown>) =>
      h("div", { "data-test": "cell", fill: String(props.fill) }),
    ComposedChart: ({ children }: { children: React.ReactNode }) =>
      h("div", { "data-test": "composed-chart" }, children),
    Legend: (props: Record<string, unknown>) => {
      const wrapperStyle = props.wrapperStyle as Record<string, unknown> | undefined;

      return h("div", {
        "data-align": String(props.align),
        "data-font-size": String(wrapperStyle?.fontSize),
        "data-height": String(props.height),
        "data-icon-size": String(props.iconSize),
        "data-test": "legend",
        "data-vertical-align": String(props.verticalAlign),
      });
    },
    Line: (props: Record<string, unknown>) => h("div", seriesAttrs("series-line", props)),
    LineChart: ({ children }: { children: React.ReactNode }) =>
      h("div", { "data-test": "line-chart" }, children),
    Pie: ({ children, ...props }: Record<string, unknown> & { children: React.ReactNode }) =>
      h(
        "div",
        {
          "data-key": String(props.dataKey),
          "data-name-key": props.nameKey === undefined ? undefined : String(props.nameKey),
          "data-test": "series-pie",
        },
        children,
      ),
    PieChart: ({ children }: { children: React.ReactNode }) =>
      h("div", { "data-test": "pie-chart" }, children),
    ResponsiveContainer: ({
      children,
      height,
      width,
    }: {
      children: React.ReactNode;
      height: number;
      width: string;
    }) =>
      h(
        "div",
        { "data-height": height, "data-test": "responsive-container", "data-width": width },
        children,
      ),
    Tooltip: (props: Record<string, unknown>) => {
      const formatter = props.formatter as ((v: unknown) => string) | undefined;
      const labelFormatter = props.labelFormatter as ((v: unknown) => string) | undefined;

      return h(
        "div",
        { "data-test": "tooltip" },
        h("span", { "data-test": "tooltip-value" }, formatter ? formatter(28000) : ""),
        h(
          "span",
          { "data-test": "tooltip-label" },
          labelFormatter ? labelFormatter("2026-01-15") : "",
        ),
      );
    },
    XAxis: (props: Record<string, unknown>) => {
      const tickFormatter = props.tickFormatter as ((v: unknown) => string) | undefined;

      return h(
        "div",
        { "data-key": String(props.dataKey), "data-test": "x-axis" },
        tickFormatter ? tickFormatter("2026-01-15") : "",
      );
    },
    YAxis: (props: Record<string, unknown>) => {
      const tick = props.tick as Record<string, unknown> | undefined;
      const tickFormatter = props.tickFormatter as ((v: unknown) => string) | undefined;

      return h(
        "div",
        {
          "data-font-size": String(tick?.fontSize),
          "data-test": "y-axis",
          "data-width": String(props.width),
        },
        tickFormatter ? tickFormatter(28000) : "",
      );
    },
  };
});

function renderChart(node: Node<"chart">) {
  return render(<ChartComponent node={node}>{null}</ChartComponent>);
}

describe("Chart component", () => {
  it("renders a composed cartesian chart from line, bar, and area series", () => {
    renderChart({
      type: "chart",
      props: {
        categoryFormat: null,
        categoryKey: "month",
        data: [
          { month: "Jan", orders: 32, revenue: 1200, forecast: 1400 },
          { month: "Feb", orders: 41, revenue: 1800, forecast: 1900 },
        ],
        description: "Monthly recurring revenue",
        valueFormat: null,
        grid: true,
        height: 280,
        legend: true,
        series: [
          {
            color: "#2563eb",
            dataKey: "revenue",
            name: "Revenue",
            nameKey: null,
            stackId: null,
            type: "line",
          },
          {
            color: "#16a34a",
            dataKey: "orders",
            name: "Orders",
            nameKey: null,
            stackId: "volume",
            type: "bar",
          },
          {
            color: "#9333ea",
            dataKey: "forecast",
            name: "Forecast",
            nameKey: null,
            stackId: null,
            type: "area",
          },
        ],
        title: "Revenue",
        tooltip: true,
        xAxis: true,
        yAxis: true,
      },
    });

    expect(screen.getByText("Revenue")).toBeVisible();
    expect(screen.getByText("Monthly recurring revenue")).toBeVisible();
    expect(screen.getByTestId("responsive-container")).toHaveAttribute("data-height", "280");
    expect(screen.getByTestId("composed-chart")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toHaveAttribute("data-key", "month");
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByTestId("legend")).toBeInTheDocument();
    expect(screen.getByTestId("legend")).toHaveAttribute("data-align", "center");
    expect(screen.getByTestId("legend")).toHaveAttribute("data-font-size", "11");
    expect(screen.getByTestId("legend")).toHaveAttribute("data-height", "24");
    expect(screen.getByTestId("legend")).toHaveAttribute("data-icon-size", "7");
    expect(screen.getByTestId("legend")).toHaveAttribute("data-vertical-align", "top");
    expect(screen.getByTestId("y-axis")).toHaveAttribute("data-font-size", "10");
    expect(screen.getByTestId("y-axis")).toHaveAttribute("data-width", "42");
    expect(screen.getByTestId("series-line")).toHaveAttribute("data-key", "revenue");
    expect(screen.getByTestId("series-bar")).toHaveAttribute("data-key", "orders");
    expect(screen.getByTestId("series-area")).toHaveAttribute("data-key", "forecast");
  });

  it("renders a pie chart with one cell per datum", () => {
    renderChart({
      type: "chart",
      props: {
        categoryFormat: null,
        categoryKey: null,
        data: [
          { amount: 4200, channel: "Direct" },
          { amount: 2600, channel: "Partner" },
        ],
        description: null,
        valueFormat: null,
        grid: true,
        height: 320,
        legend: true,
        series: [
          {
            color: null,
            dataKey: "amount",
            name: null,
            nameKey: "channel",
            stackId: null,
            type: "pie",
          },
        ],
        title: "Revenue by channel",
        tooltip: true,
        xAxis: true,
        yAxis: true,
      },
    });

    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    expect(screen.getByTestId("series-pie")).toHaveAttribute("data-key", "amount");
    expect(screen.getByTestId("series-pie")).toHaveAttribute("data-name-key", "channel");
    expect(screen.getAllByTestId("cell")).toHaveLength(2);
  });

  it("prefers datum colors before falling back to the series color for pie cells", () => {
    renderChart({
      type: "chart",
      props: {
        categoryFormat: null,
        categoryKey: null,
        data: [
          { amount: 4200, channel: "Direct", color: "#111827" },
          { amount: 2600, channel: "Partner" },
        ],
        description: null,
        valueFormat: null,
        grid: true,
        height: 320,
        legend: true,
        series: [
          {
            color: "#2563eb",
            dataKey: "amount",
            name: null,
            nameKey: "channel",
            stackId: null,
            type: "pie",
          },
        ],
        title: "Revenue by channel",
        tooltip: true,
        xAxis: true,
        yAxis: true,
      },
    });

    const cells = screen.getAllByTestId("cell");

    expect(cells[0]).toHaveAttribute("fill", "#111827");
    expect(cells[1]).toHaveAttribute("fill", "#2563eb");
  });

  it("uses dedicated recharts containers for single-type area and bar charts", () => {
    const area = renderChart({
      type: "chart",
      props: {
        categoryFormat: null,
        categoryKey: "month",
        data: [{ forecast: 1400, month: "Jan" }],
        description: null,
        valueFormat: null,
        grid: true,
        height: 320,
        legend: true,
        series: [
          {
            color: "#9333ea",
            dataKey: "forecast",
            name: "Forecast",
            nameKey: null,
            stackId: null,
            type: "area",
          },
        ],
        title: null,
        tooltip: true,
        xAxis: true,
        yAxis: true,
      },
    });

    expect(screen.getByTestId("area-chart")).toBeInTheDocument();

    area.unmount();

    renderChart({
      type: "chart",
      props: {
        categoryFormat: null,
        categoryKey: "month",
        data: [{ month: "Jan", orders: 32 }],
        description: null,
        valueFormat: null,
        grid: true,
        height: 320,
        legend: true,
        series: [
          {
            color: "#16a34a",
            dataKey: "orders",
            name: "Orders",
            nameKey: null,
            stackId: null,
            type: "bar",
          },
        ],
        title: null,
        tooltip: true,
        xAxis: true,
        yAxis: true,
      },
    });

    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("renders an empty cartesian chart when no series are configured", () => {
    renderChart({
      type: "chart",
      props: {
        categoryFormat: null,
        categoryKey: "month",
        data: [{ month: "Jan" }],
        description: null,
        valueFormat: null,
        grid: true,
        height: 320,
        legend: true,
        series: [],
        title: null,
        tooltip: true,
        xAxis: true,
        yAxis: true,
      },
    });

    expect(screen.getByTestId("composed-chart")).toBeInTheDocument();
  });

  it("keeps cartesian series visible when a pie series is also present", () => {
    renderChart({
      type: "chart",
      props: {
        categoryFormat: null,
        categoryKey: "month",
        data: [{ amount: 4200, month: "Jan", revenue: 1200 }],
        description: null,
        valueFormat: null,
        grid: true,
        height: 320,
        legend: true,
        series: [
          {
            color: null,
            dataKey: "amount",
            name: null,
            nameKey: "month",
            stackId: null,
            type: "pie",
          },
          {
            color: null,
            dataKey: "revenue",
            name: "Revenue",
            nameKey: null,
            stackId: null,
            type: "line",
          },
        ],
        title: null,
        tooltip: true,
        xAxis: true,
        yAxis: true,
      },
    });

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getByTestId("series-line")).toHaveAttribute("data-key", "revenue");
    expect(screen.queryByTestId("pie-chart")).not.toBeInTheDocument();
  });

  it("formats axis ticks and tooltip via value and category formats", () => {
    renderChart({
      type: "chart",
      props: {
        categoryFormat: {
          kind: "date",
          dateStyle: "short",
          timeStyle: null,
          month: null,
          year: null,
        },
        categoryKey: "month",
        data: [{ month: "2026-01-15", revenue: 28000 }],
        description: null,
        valueFormat: {
          kind: "number",
          notation: "compact",
          minimumFractionDigits: null,
          maximumFractionDigits: null,
          currency: "USD",
          unit: null,
        },
        grid: true,
        height: 320,
        legend: true,
        series: [
          {
            color: null,
            dataKey: "revenue",
            name: null,
            nameKey: null,
            stackId: null,
            type: "line",
          },
        ],
        title: null,
        tooltip: true,
        xAxis: true,
        yAxis: true,
      },
    });

    expect(screen.getByTestId("y-axis")).toHaveTextContent("$28K");
    expect(screen.getByTestId("tooltip-value")).toHaveTextContent("$28K");
    expect(screen.getByTestId("x-axis").textContent).not.toBe("2026-01-15");
  });
});

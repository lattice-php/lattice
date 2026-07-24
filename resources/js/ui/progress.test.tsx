import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import type { Progress } from "@lattice-php/lattice/types/generated";
import ProgressComponent from "./progress";

function renderProgress(props: Partial<Progress>) {
  const node = fakeNode({
    type: "progress",
    props: {
      value: 0,
      max: 100,
      shape: "bar",
      showValue: false,
      color: null,
      size: "md",
      ...props,
    },
  });
  return render(<ProgressComponent node={node}>{null}</ProgressComponent>);
}

describe("ProgressComponent bar", () => {
  it("renders the fill width from value and max with aria state", () => {
    const { container } = renderProgress({ value: 72.5 });

    const track = screen.getByRole("progressbar");
    expect(track).toHaveAttribute("aria-valuemin", "0");
    expect(track).toHaveAttribute("aria-valuemax", "100");
    expect(track).toHaveAttribute("aria-valuenow", "72.5");
    expect(track).toHaveAttribute("aria-valuetext", "73%");
    expect(container.querySelector('[data-lattice-progress="bar"]')).not.toBeNull();

    const fill = track.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("72.5%");
  });

  it("clamps the value into the 0..max range", () => {
    renderProgress({ value: 150 });

    const track = screen.getByRole("progressbar");
    expect(track).toHaveAttribute("aria-valuenow", "100");
    expect((track.firstElementChild as HTMLElement).style.width).toBe("100%");
  });

  it("renders an empty fill when max is not positive", () => {
    renderProgress({ value: 10, max: 0 });

    const track = screen.getByRole("progressbar");
    expect((track.firstElementChild as HTMLElement).style.width).toBe("0%");
  });

  it("shows the percent readout when showValue is set", () => {
    renderProgress({ value: 50, showValue: true });

    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("maps color and size onto the fill and track", () => {
    renderProgress({
      value: 40,
      color: { kind: "named", value: "success", dark: null },
      size: "lg",
    });

    const track = screen.getByRole("progressbar");
    expect(track.className).toContain("h-3");
    const fill = track.firstElementChild as HTMLElement;
    expect(fill.style.getPropertyValue("background")).toBe("var(--lt-color-success)");
  });
});

describe("ProgressComponent circle", () => {
  it("renders the ring offset from value and max", () => {
    const { container } = renderProgress({ value: 25, shape: "circle" });

    const circumference = 2 * Math.PI * 18;
    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(2);
    const ring = circles[1];
    expect(Number.parseFloat(ring.getAttribute("stroke-dasharray") ?? "")).toBeCloseTo(
      circumference,
      2,
    );
    expect(Number.parseFloat(ring.getAttribute("stroke-dashoffset") ?? "")).toBeCloseTo(
      circumference * 0.75,
      2,
    );
    expect(container.querySelector('[data-lattice-progress="circle"]')).not.toBeNull();
  });

  it("scales the ring with size and centers the readout", () => {
    const { container } = renderProgress({
      value: 35,
      max: 50,
      shape: "circle",
      size: "xl",
      showValue: true,
    });

    expect(container.querySelector("svg")).toHaveAttribute("width", "64");
    expect(screen.getByText("70%")).toBeInTheDocument();
  });

  it("colors the ring stroke from the color prop", () => {
    const { container } = renderProgress({
      value: 10,
      shape: "circle",
      color: { kind: "named", value: "danger", dark: null },
    });

    const ring = container.querySelectorAll("circle")[1];
    expect(ring.style.getPropertyValue("color")).toBe("var(--lt-color-danger)");
  });
});

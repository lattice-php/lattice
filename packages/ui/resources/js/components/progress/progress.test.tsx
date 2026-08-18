import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Progress } from "./progress";
import type { ProgressProps } from "./progress";

function renderProgress(props: Partial<ProgressProps>) {
  return render(<Progress value={0} {...props} />);
}

describe("Progress bar", () => {
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

  it("maps the color onto the fill", () => {
    renderProgress({ value: 40, color: "success" });

    const track = screen.getByRole("progressbar");
    const fill = track.firstElementChild as HTMLElement;
    expect(fill.style.getPropertyValue("background")).toBe("var(--lt-color-success)");
  });
});

describe("Progress circle", () => {
  it("renders the ring offset from value and max", () => {
    const { container } = renderProgress({ value: 25, shape: "circle" });

    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(2);
    const ring = circles[1];
    const dasharray = Number.parseFloat(ring.getAttribute("stroke-dasharray") ?? "");
    const dashoffset = Number.parseFloat(ring.getAttribute("stroke-dashoffset") ?? "");
    expect(dasharray).toBeGreaterThan(0);
    expect(dashoffset / dasharray).toBeCloseTo(0.75, 5);
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
    const { container } = renderProgress({ value: 10, shape: "circle", color: "danger" });

    const ring = container.querySelectorAll("circle")[1];
    expect(ring.style.getPropertyValue("color")).toBe("var(--lt-color-danger)");
  });
});

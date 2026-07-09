import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Option } from "@lattice-php/lattice/core/types";
import { SegmentedPills } from "./segmented-pills";

const options: Option[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

describe("SegmentedPills", () => {
  it("marks the selected pill and calls onSelect on click", () => {
    const onSelect = vi.fn<(value: string) => void>();
    render(<SegmentedPills name="theme" onSelect={onSelect} options={options} value="light" />);

    expect(screen.getByRole("radio", { name: "Light" })).toHaveAttribute("aria-checked", "true");

    fireEvent.click(screen.getByRole("radio", { name: "Dark" }));
    expect(onSelect).toHaveBeenCalledWith("dark");
  });

  it("falls back to a generic test id prefix when unnamed", () => {
    render(
      <SegmentedPills
        onSelect={vi.fn<(value: string) => void>()}
        options={options}
        value="light"
      />,
    );

    expect(screen.getByTestId("segment-dark")).toBeInTheDocument();
  });

  it("disables every pill when disabled", () => {
    render(
      <SegmentedPills
        onSelect={vi.fn<(value: string) => void>()}
        options={options}
        value="light"
        disabled
      />,
    );

    expect(screen.getByRole("radio", { name: "Light" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Dark" })).toBeDisabled();
  });

  it("does not steal focus when autoFocus is off", () => {
    render(
      <SegmentedPills
        onSelect={vi.fn<(value: string) => void>()}
        options={options}
        value="light"
      />,
    );

    expect(document.body).toHaveFocus();
  });

  it("focuses the selected pill when autoFocus is on", () => {
    render(
      <SegmentedPills
        onSelect={vi.fn<(value: string) => void>()}
        options={options}
        value="dark"
        autoFocus
      />,
    );

    expect(screen.getByRole("radio", { name: "Dark" })).toHaveFocus();
  });

  it("focuses the first pill when autoFocus is on and nothing is selected", () => {
    render(
      <SegmentedPills
        onSelect={vi.fn<(value: string) => void>()}
        options={options}
        value=""
        autoFocus
      />,
    );

    expect(screen.getByRole("radio", { name: "Light" })).toHaveFocus();
  });
});

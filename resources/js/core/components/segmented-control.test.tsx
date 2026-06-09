import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Node } from "@bambamboole/lattice/core/types";
import SegmentedControlComponent from "./segmented-control";

describe("SegmentedControl", () => {
  it("emits a window event with the selected value on change", () => {
    const handleChange = vi.fn<(event: Event) => void>();
    const node = {
      props: {
        emits: "lattice:appearance-change",
        label: "Appearance",
        name: "appearance",
        options: [
          { label: "Light", value: "light" },
          { label: "Dark", value: "dark" },
          { label: "System", value: "system" },
        ],
        value: "system",
      },
      type: "segmented-control",
    } satisfies Node<"segmented-control">;

    window.addEventListener("lattice:appearance-change", handleChange);

    render(<SegmentedControlComponent node={node}>{null}</SegmentedControlComponent>);

    expect(screen.getByLabelText("Appearance")).toBeVisible();
    expect(screen.getByRole("radio", { name: "System" })).toHaveAttribute("aria-checked", "true");

    fireEvent.click(screen.getByRole("radio", { name: "Dark" }));

    expect(screen.getByRole("radio", { name: "Dark" })).toHaveAttribute("aria-checked", "true");
    expect(handleChange).toHaveBeenCalledTimes(1);
    const [[changeEvent]] = handleChange.mock.calls as [[CustomEvent]];

    expect(changeEvent.detail).toEqual({ name: "appearance", value: "dark" });

    window.removeEventListener("lattice:appearance-change", handleChange);
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { SegmentedControlAdapter } from "./segmented-control-adapter";

describe("SegmentedControlAdapter", () => {
  it("emits the configured window event with the selected value", () => {
    const handleChange = vi.fn<(event: Event) => void>();
    const node = fakeNode({
      props: {
        emits: "lattice:appearance-change",
        label: "Appearance",
        name: "appearance",
        options: [
          { label: "Light", value: "light", data: null },
          { label: "Dark", value: "dark", data: null },
          { label: "System", value: "system", data: null },
        ],
        value: "system",
      },
      type: "segmented-control",
    });

    window.addEventListener("lattice:appearance-change", handleChange);

    render(<SegmentedControlAdapter node={node}>{null}</SegmentedControlAdapter>);

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

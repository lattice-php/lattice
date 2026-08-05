import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EventBridge } from "@lattice-php/lattice";

describe("EventBridge", () => {
  it("passes appearance events to the host handler", () => {
    const onAppearanceChange = vi.fn<(appearance: string) => void>();

    render(<EventBridge onAppearanceChange={onAppearanceChange} />);

    window.dispatchEvent(
      new CustomEvent("lattice:appearance-change", {
        detail: {
          value: "dark",
        },
      }),
    );

    expect(onAppearanceChange).toHaveBeenCalledWith("dark");
  });

  it("ignores appearance events with unknown values", () => {
    const onAppearanceChange = vi.fn<(appearance: string) => void>();

    render(<EventBridge onAppearanceChange={onAppearanceChange} />);

    window.dispatchEvent(
      new CustomEvent("lattice:appearance-change", {
        detail: {
          value: "sepia",
        },
      }),
    );

    expect(onAppearanceChange).not.toHaveBeenCalled();
  });
});

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EventBridge } from "@lattice-php/lattice";
import type { ToastMessage } from "@lattice-php/lattice";

describe("EventBridge", () => {
  it("forwards lattice toast events to the host renderer with the full message", () => {
    const onToast = vi.fn<(toast: ToastMessage) => void>();

    render(<EventBridge onToast={onToast} />);

    window.dispatchEvent(
      new CustomEvent("lattice:toast", {
        detail: {
          type: "toast",
          toast: { message: "Action handled.", variant: "warning" },
        },
      }),
    );

    expect(onToast).toHaveBeenCalledWith({
      action: null,
      dismissible: true,
      duration: null,
      message: "Action handled.",
      persistent: false,
      variant: "warning",
    });
  });

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

  it("ignores toast events without a message", () => {
    const onToast = vi.fn<(toast: ToastMessage) => void>();

    render(<EventBridge onToast={onToast} />);

    window.dispatchEvent(
      new CustomEvent("lattice:toast", {
        detail: { type: "toast", toast: { variant: "warning" } },
      }),
    );

    expect(onToast).not.toHaveBeenCalled();
  });
});

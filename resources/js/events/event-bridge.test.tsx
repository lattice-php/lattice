import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventBridge } from "@lattice";

type FlashListener = (
  event: CustomEvent<{
    flash?: {
      toast?: unknown;
    };
  }>,
) => void;

const router = vi.hoisted(() => ({
  on: vi.fn<(event: string, listener: FlashListener) => () => void>(() => () => undefined),
  reload: vi.fn<() => void>(),
}));

vi.mock("@inertiajs/react", () => ({
  router,
}));

describe("EventBridge", () => {
  beforeEach(() => {
    router.on.mockClear();
    router.reload.mockReset();
  });

  it("passes inertia flash toast messages to the host renderer", () => {
    const onToast = vi.fn<(toast: { message: string; variant: string }) => void>();

    render(<EventBridge onToast={onToast} />);

    const [, listener] = router.on.mock.calls[0] as ["flash", FlashListener];

    listener(
      new CustomEvent("flash", {
        detail: {
          flash: {
            toast: {
              message: "Profile saved.",
              variant: "info",
            },
          },
        },
      }),
    );

    expect(onToast).toHaveBeenCalledWith({
      message: "Profile saved.",
      variant: "info",
    });
  });

  it("passes lattice toast events to the host renderer", () => {
    const onToast = vi.fn<(toast: { message: string; variant: string }) => void>();

    render(<EventBridge onToast={onToast} />);

    window.dispatchEvent(
      new CustomEvent("lattice:toast", {
        detail: {
          message: "Action handled.",
          type: "toast",
          variant: "warning",
        },
      }),
    );

    expect(onToast).toHaveBeenCalledWith({
      message: "Action handled.",
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

  it("does not reload the whole page for component reload events", () => {
    render(<EventBridge onToast={vi.fn<(toast: { message: string; variant: string }) => void>()} />);

    window.dispatchEvent(
      new CustomEvent("lattice:reload-component", {
        detail: {
          component: "settings.passkeys",
          type: "reloadComponent",
        },
      }),
    );

    expect(router.reload).not.toHaveBeenCalled();
  });
});

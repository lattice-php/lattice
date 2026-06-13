import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LATTICE_EVENT } from "@lattice-php/lattice/events/event-names";
import { useFlashToasts } from "./use-flash-toasts";

type FlashListener = (
  event: CustomEvent<{
    flash?: {
      toast?: unknown;
    };
  }>,
) => void;

const router = vi.hoisted(() => ({
  on: vi.fn<(event: string, listener: FlashListener) => () => void>(() => () => undefined),
}));

vi.mock("@inertiajs/react", () => ({ router }));

function Host() {
  useFlashToasts();

  return null;
}

describe("useFlashToasts", () => {
  beforeEach(() => router.on.mockClear());

  it("funnels Laravel flash toasts onto the shared lattice:toast bus", () => {
    const received = vi.fn<(event: Event) => void>();
    window.addEventListener(LATTICE_EVENT.toast, received);

    render(<Host />);

    const [event, listener] = router.on.mock.calls[0] as ["flash", FlashListener];
    expect(event).toBe("flash");

    listener(
      new CustomEvent("flash", {
        detail: { flash: { toast: { message: "Profile saved.", variant: "info" } } },
      }),
    );

    expect(received).toHaveBeenCalledTimes(1);
    const dispatched = received.mock.calls[0]?.[0] as CustomEvent;
    expect(dispatched.detail.toast).toEqual({
      action: null,
      dismissible: true,
      duration: null,
      message: "Profile saved.",
      persistent: false,
      variant: "info",
    });

    window.removeEventListener(LATTICE_EVENT.toast, received);
  });

  it("ignores flash payloads without a toast", () => {
    const received = vi.fn<(event: Event) => void>();
    window.addEventListener(LATTICE_EVENT.toast, received);

    render(<Host />);

    const [, listener] = router.on.mock.calls[0] as ["flash", FlashListener];
    listener(new CustomEvent("flash", { detail: { flash: {} } }));

    expect(received).not.toHaveBeenCalled();

    window.removeEventListener(LATTICE_EVENT.toast, received);
  });
});

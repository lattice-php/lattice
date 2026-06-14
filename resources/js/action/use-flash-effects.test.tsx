import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LATTICE_EVENT } from "@lattice-php/lattice/events/event-names";

type FlashListener = (
  event: CustomEvent<{
    flash?: {
      latticeEffects?: unknown;
    };
  }>,
) => void;

const router = vi.hoisted(() => ({
  on: vi.fn<(event: string, listener: FlashListener) => () => void>(() => () => undefined),
}));

vi.mock("@inertiajs/react", () => ({ router }));

import { useFlashEffects } from "@lattice-php/lattice/action/use-flash-effects";

function Host() {
  useFlashEffects();

  return null;
}

describe("useFlashEffects", () => {
  beforeEach(() => router.on.mockClear());

  it("dispatches flashed effects onto the bus", () => {
    const received = vi.fn<(event: Event) => void>();
    window.addEventListener(LATTICE_EVENT.callout, received);

    try {
      render(<Host />);

      const [event, listener] = router.on.mock.calls[0] as ["flash", FlashListener];
      expect(event).toBe("flash");

      listener(
        new CustomEvent("flash", {
          detail: {
            flash: {
              latticeEffects: [
                {
                  type: "callout",
                  callout: {
                    variant: "info",
                    title: null,
                    message: "Hi",
                    dismissible: true,
                    action: null,
                  },
                },
              ],
            },
          },
        }),
      );

      expect(received).toHaveBeenCalledTimes(1);
      const dispatched = received.mock.calls[0]?.[0] as CustomEvent;
      expect(dispatched.detail.type).toBe("callout");
    } finally {
      window.removeEventListener(LATTICE_EVENT.callout, received);
    }
  });

  it("does nothing when there are no flashed effects", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    render(<Host />);

    const [, listener] = router.on.mock.calls[0] as ["flash", FlashListener];

    expect(() => listener(new CustomEvent("flash", { detail: { flash: {} } }))).not.toThrow();

    const latticeEvents = dispatchSpy.mock.calls.filter(
      ([e]) => e instanceof CustomEvent && e.type.startsWith("lattice:"),
    );
    expect(latticeEvents).toHaveLength(0);

    dispatchSpy.mockRestore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});

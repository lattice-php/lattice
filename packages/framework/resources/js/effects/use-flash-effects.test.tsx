import { render } from "@testing-library/react";
import { router } from "@inertiajs/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import { Provider } from "@lattice-php/lattice/provider";

type FlashListener = (
  event: CustomEvent<{
    flash?: {
      latticeEffects?: unknown;
    };
  }>,
) => void;

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock(),
);

import { useFlashEffects } from "./use-flash-effects";

function Host() {
  useFlashEffects();

  return null;
}

function Wrapper({ children }: { children: ReactNode }) {
  return <Provider toaster={false}>{children}</Provider>;
}

describe("useFlashEffects", () => {
  beforeEach(() => vi.mocked(router.on).mockClear());

  it("dispatches flashed effects onto the bus", () => {
    const received = vi.fn<(event: Event) => void>();
    window.addEventListener(LATTICE_EVENT.callout, received);

    try {
      render(<Host />, { wrapper: Wrapper });

      const [event, listener] = vi.mocked(router.on).mock.calls[0] as unknown as [
        "flash",
        FlashListener,
      ];
      expect(event).toBe("flash");

      listener(
        new CustomEvent("flash", {
          detail: {
            flash: {
              latticeEffects: [
                {
                  type: "callout",
                  props: {
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
      expect(dispatched.detail.message).toBe("Hi");
    } finally {
      window.removeEventListener(LATTICE_EVENT.callout, received);
    }
  });

  it("does nothing when there are no flashed effects", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    render(<Host />, { wrapper: Wrapper });

    const [, listener] = vi.mocked(router.on).mock.calls[0] as unknown as ["flash", FlashListener];

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

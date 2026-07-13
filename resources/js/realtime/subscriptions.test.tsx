import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Listen } from "@lattice-php/lattice/types/generated";

const handlers: { current: ((payload: unknown) => void) | null } = { current: null };

vi.mock("@laravel/echo-react", () => ({
  useEcho: (_channel: string, _events: string[], callback: (payload: unknown) => void) => {
    handlers.current = callback;
    return {};
  },
  useEchoPublic: (_channel: string, _events: string[], callback: (payload: unknown) => void) => {
    handlers.current = callback;
    return {};
  },
  useEchoPresence: (_channel: string, _events: string[], callback: (payload: unknown) => void) => {
    handlers.current = callback;
    return {};
  },
}));

import Subscriptions from "./subscriptions";

const toasts: unknown[] = [];

const collectToast = (event: Event) => {
  toasts.push((event as CustomEvent).detail);
};

beforeEach(() => {
  handlers.current = null;
  toasts.length = 0;
  window.addEventListener("lattice:toast", collectToast);
});

afterEach(() => {
  window.removeEventListener("lattice:toast", collectToast);
  vi.clearAllMocks();
});

describe("Subscriptions", () => {
  it("dispatches a resolved toast effect when its event fires", () => {
    const listeners: Listen[] = [
      {
        channel: "orders",
        visibility: "private",
        events: ["OrderShipped"],
        effects: [
          {
            type: "toast",
            props: {
              variant: "success",
              message: {
                key: "orders.shipped-live",
                payload: { id: "order.id" },
                replacements: {},
              },
            },
          } as never,
        ],
      },
    ];

    render(<Subscriptions listeners={listeners} />);

    expect(handlers.current).toBeTypeOf("function");

    handlers.current?.({ order: { id: 7 } });

    expect(toasts).toHaveLength(1);
    expect((toasts[0] as { message: string }).message).toContain("orders.shipped-live");
  });

  it.each(["public", "private", "presence"] as const)(
    "subscribes to %s channels and dispatches their effects",
    (visibility) => {
      const listeners: Listen[] = [
        {
          channel: "orders",
          visibility,
          events: ["OrderShipped"],
          effects: [
            {
              type: "toast",
              props: {
                variant: "success",
                message: { key: "orders.live", payload: {}, replacements: {} },
              },
            } as never,
          ],
        },
      ];

      render(<Subscriptions listeners={listeners} />);
      handlers.current?.({});

      expect(toasts).toHaveLength(1);
    },
  );

  it("passes non-toast effects through untouched, even for non-object payloads", () => {
    const closed: unknown[] = [];
    const collect = (event: Event) => closed.push((event as CustomEvent).detail);
    window.addEventListener("lattice:close-modal", collect);

    const listeners: Listen[] = [
      {
        channel: "orders",
        visibility: "public",
        events: ["OrderShipped"],
        effects: [{ type: "close-modal", props: { target: "checkout" } } as never],
      },
    ];

    render(<Subscriptions listeners={listeners} />);
    handlers.current?.("not-an-object");

    expect(closed).toHaveLength(1);
    expect(toasts).toHaveLength(0);

    window.removeEventListener("lattice:close-modal", collect);
  });
});

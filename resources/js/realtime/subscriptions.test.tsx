import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ListenerPayload } from "@lattice-php/lattice/types/generated";

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
  toasts.push((event as CustomEvent).detail.toast);
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
    const listeners: ListenerPayload[] = [
      {
        channel: "orders",
        visibility: "private",
        events: ["OrderShipped"],
        effects: [
          {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: "toast",
            toast: {
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
});

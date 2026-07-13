import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Listen } from "@lattice-php/lattice/types/generated";
import { RealtimeListeners } from "./listeners";

const state = vi.hoisted(() => ({ shouldThrow: false }));

vi.mock("./subscriptions", () => ({
  default: ({ listeners }: { listeners: Listen[] }) => {
    if (state.shouldThrow) {
      throw new Error("Echo is unavailable");
    }
    return <div data-test="subscriptions">{listeners.length} listeners</div>;
  },
}));

const listener: Listen = {
  channel: "orders",
  visibility: "public",
  events: ["OrderShipped"],
  effects: [],
};

beforeEach(() => {
  state.shouldThrow = false;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("RealtimeListeners", () => {
  it("renders nothing when no listeners are declared", () => {
    const { container } = render(<RealtimeListeners />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for an empty listener list", () => {
    const { container } = render(<RealtimeListeners listeners={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("lazily mounts the subscriptions when listeners are present", async () => {
    render(<RealtimeListeners listeners={[listener]} />);

    expect(await screen.findByTestId("subscriptions")).toHaveTextContent("1 listeners");
  });

  it("swallows Echo failures and warns instead of crashing", async () => {
    state.shouldThrow = true;
    vi.spyOn(console, "error").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { container } = render(<RealtimeListeners listeners={[listener]} />);

    await waitFor(() => expect(warn).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
    expect(warn.mock.calls[0][0]).toContain("[lattice]");
  });
});

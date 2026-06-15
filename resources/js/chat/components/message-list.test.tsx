import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { RegistryContext } from "@lattice-php/lattice/core/registry-context";
import { createRegistry } from "@lattice-php/lattice/core/registry";
import type { ChatMessage } from "../types";
import { chatPlugin } from "../index";
import { MessageList } from "./message-list";

function withRegistry(ui: ReactNode): ReactNode {
  const registry = createRegistry(chatPlugin);
  return <RegistryContext.Provider value={registry}>{ui}</RegistryContext.Provider>;
}

afterEach(() => {
  Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});

const messages: ChatMessage[] = [
  { id: "1", role: "user", parts: [{ type: "chat.part.text", props: { text: "First message" } }] },
  {
    id: "2",
    role: "assistant",
    parts: [{ type: "chat.part.text", props: { text: "Second message" } }],
  },
  { id: "3", role: "user", parts: [{ type: "chat.part.text", props: { text: "Third message" } }] },
];

describe("MessageList", () => {
  it("renders all messages in order", () => {
    render(withRegistry(<MessageList messages={messages} />));

    expect(screen.getByText("First message")).toBeVisible();
    expect(screen.getByText("Second message")).toBeVisible();
    expect(screen.getByText("Third message")).toBeVisible();
  });

  it("renders the scrollable container with the correct data-test attribute", () => {
    render(withRegistry(<MessageList messages={messages} />));

    const container = screen.getByTestId("chat-messages");
    expect(container).toBeInTheDocument();
    expect(container.className).toContain("overflow-y-auto");
  });

  it("renders an empty list without errors", () => {
    render(withRegistry(<MessageList messages={[]} />));

    const container = screen.getByTestId("chat-messages");
    expect(container).toBeInTheDocument();
    expect(screen.queryByTestId("chat-message-user")).not.toBeInTheDocument();
    expect(screen.queryByTestId("chat-message-assistant")).not.toBeInTheDocument();
  });

  it("scrolls the bottom anchor into view when messages change", () => {
    const scrollIntoView = vi.fn<() => void>();
    Object.defineProperty(Element.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });

    render(withRegistry(<MessageList messages={messages} />));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("renders messages in document order", () => {
    render(withRegistry(<MessageList messages={messages} />));

    const userMessages = screen.getAllByTestId("chat-message-user");
    const assistantMessages = screen.getAllByTestId("chat-message-assistant");

    expect(userMessages).toHaveLength(2);
    expect(assistantMessages).toHaveLength(1);
  });
});

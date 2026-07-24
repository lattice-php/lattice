import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRegistry } from "@lattice-php/lattice/core/registry";
import type { ChatMessage } from "@lattice-php/lattice/chat/types";
import { chatComponents } from "@lattice-php/lattice/chat/plugin";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import { MessageList } from "./message-list";

const registry = createRegistry(chatComponents);

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
    renderWithRegistry(<MessageList messages={messages} />, registry);

    expect(screen.getByText("First message")).toBeVisible();
    expect(screen.getByText("Second message")).toBeVisible();
    expect(screen.getByText("Third message")).toBeVisible();
  });

  it("renders an empty list without errors", () => {
    renderWithRegistry(<MessageList messages={[]} />, registry);

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

    renderWithRegistry(<MessageList messages={messages} />, registry);

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("renders messages in document order", () => {
    renderWithRegistry(<MessageList messages={messages} />, registry);

    const userMessages = screen.getAllByTestId("chat-message-user");
    const assistantMessages = screen.getAllByTestId("chat-message-assistant");

    expect(userMessages).toHaveLength(2);
    expect(assistantMessages).toHaveLength(1);
  });
});

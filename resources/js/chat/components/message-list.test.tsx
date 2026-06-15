import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ChatMessage } from "../types";
import "../parts/text";
import { MessageList } from "./message-list";

const messages: ChatMessage[] = [
  { id: "1", role: "user", parts: [{ type: "text", text: "First message" }] },
  { id: "2", role: "assistant", parts: [{ type: "text", text: "Second message" }] },
  { id: "3", role: "user", parts: [{ type: "text", text: "Third message" }] },
];

describe("MessageList", () => {
  it("renders all messages in order", () => {
    render(<MessageList messages={messages} />);

    expect(screen.getByText("First message")).toBeVisible();
    expect(screen.getByText("Second message")).toBeVisible();
    expect(screen.getByText("Third message")).toBeVisible();
  });

  it("renders the scrollable container with the correct data-test attribute", () => {
    render(<MessageList messages={messages} />);

    const container = screen.getByTestId("chat-messages");
    expect(container).toBeInTheDocument();
    expect(container.className).toContain("overflow-y-auto");
  });

  it("renders an empty list without errors", () => {
    render(<MessageList messages={[]} />);

    const container = screen.getByTestId("chat-messages");
    expect(container).toBeInTheDocument();
    expect(screen.queryByTestId("chat-message-user")).not.toBeInTheDocument();
    expect(screen.queryByTestId("chat-message-assistant")).not.toBeInTheDocument();
  });

  it("renders messages in document order", () => {
    render(<MessageList messages={messages} />);

    const userMessages = screen.getAllByTestId("chat-message-user");
    const assistantMessages = screen.getAllByTestId("chat-message-assistant");

    expect(userMessages).toHaveLength(2);
    expect(assistantMessages).toHaveLength(1);
  });
});

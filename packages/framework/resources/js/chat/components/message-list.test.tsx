import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRegistry } from "@lattice-php/core/registry";
import type { ChatMessage } from "@lattice-php/lattice/chat/types";
import { chatComponents } from "@lattice-php/lattice/chat/plugin";
import { renderWithRegistry } from "@lattice-php/core/test-support";
import { MessageList } from "./message-list";

const registry = createRegistry(chatComponents);

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
});

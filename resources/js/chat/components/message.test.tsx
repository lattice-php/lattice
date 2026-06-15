import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { RegistryContext } from "@lattice-php/lattice/core/registry-context";
import { createPlugin, createRegistry } from "@lattice-php/lattice/core/registry";
import type { ChatPartComponent } from "../part-registry";
import type { ChatMessage } from "../types";
import { chatPlugin } from "../index";
import { Message } from "./message";

function withRegistry(ui: ReactNode, extraParts?: Record<string, ChatPartComponent>): ReactNode {
  const registry = createRegistry(
    chatPlugin,
    ...(extraParts ? [createPlugin({ name: "test", chatParts: extraParts })] : []),
  );
  return <RegistryContext.Provider value={registry}>{ui}</RegistryContext.Provider>;
}

const CustomPart: ChatPartComponent = ({ part }) => (
  <span data-test="custom-part">{(part as { type: string; label: string }).label}</span>
);

describe("Message", () => {
  it("renders a user message with its text part", () => {
    const message: ChatMessage = {
      id: "1",
      role: "user",
      parts: [{ type: "text", text: "Hello there" }],
    };

    render(withRegistry(<Message message={message} />));

    expect(screen.getByText("Hello there")).toBeVisible();
    expect(screen.getByTestId("chat-message-user")).toBeInTheDocument();
  });

  it("renders an assistant message with its text part", () => {
    const message: ChatMessage = {
      id: "2",
      role: "assistant",
      parts: [{ type: "text", text: "Hi, how can I help?" }],
    };

    render(withRegistry(<Message message={message} />));

    expect(screen.getByText("Hi, how can I help?")).toBeVisible();
    expect(screen.getByTestId("chat-message-assistant")).toBeInTheDocument();
  });

  it("renders both a text part and a custom registered part", () => {
    const message: ChatMessage = {
      id: "3",
      role: "assistant",
      parts: [
        { type: "text", text: "Thinking…" },
        { type: "custom", label: "my-tool" },
      ],
    };

    render(withRegistry(<Message message={message} />, { custom: CustomPart }));

    expect(screen.getByText("Thinking…")).toBeVisible();
    expect(screen.getByTestId("custom-part")).toHaveTextContent("my-tool");
  });

  it("renders nothing for an unknown part type", () => {
    const message: ChatMessage = {
      id: "4",
      role: "user",
      parts: [{ type: "unknown-type-xyz" }],
    };

    const { container } = render(withRegistry(<Message message={message} />));
    const bubble = container.querySelector('[data-test="chat-message-user"]');
    expect(bubble).toBeInTheDocument();
    expect(bubble?.textContent).toBe("");
  });

  it("applies different alignment for user vs assistant", () => {
    const userMsg: ChatMessage = { id: "u1", role: "user", parts: [] };
    const assistantMsg: ChatMessage = { id: "a1", role: "assistant", parts: [] };

    const { container: userContainer } = render(withRegistry(<Message message={userMsg} />));
    const { container: assistantContainer } = render(
      withRegistry(<Message message={assistantMsg} />),
    );

    const userEl = userContainer.querySelector('[data-test="chat-message-user"]');
    const assistantEl = assistantContainer.querySelector('[data-test="chat-message-assistant"]');

    expect(userEl?.className).toContain("items-end");
    expect(assistantEl?.className).toContain("items-start");
  });
});

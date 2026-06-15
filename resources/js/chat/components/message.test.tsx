import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { RegistryContext } from "@lattice-php/lattice/core/registry-context";
import { createPlugin, createRegistry, eagerComponent } from "@lattice-php/lattice/core/registry";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import type { ComponentRegistry } from "@lattice-php/lattice/core/registry";
import type { ChatMessage } from "../types";
import { chatPlugin } from "../index";
import { Message } from "./message";

function withRegistry(ui: ReactNode, extraComponents?: ComponentRegistry): ReactNode {
  const registry = createRegistry(
    chatPlugin,
    ...(extraComponents ? [createPlugin({ name: "test", components: extraComponents })] : []),
  );
  return <RegistryContext.Provider value={registry}>{ui}</RegistryContext.Provider>;
}

const CustomPart: RendererComponent = ({ node }) => (
  <span data-test="custom-part">{(node.props as { label: string }).label}</span>
);

describe("Message", () => {
  it("renders a user message with its text part", () => {
    const message: ChatMessage = {
      id: "1",
      role: "user",
      parts: [{ type: "chat.part.text", props: { text: "Hello there" } }],
    };

    render(withRegistry(<Message message={message} />));

    expect(screen.getByText("Hello there")).toBeVisible();
    expect(screen.getByTestId("chat-message-user")).toBeInTheDocument();
  });

  it("renders an assistant message with its text part", () => {
    const message: ChatMessage = {
      id: "2",
      role: "assistant",
      parts: [{ type: "chat.part.text", props: { text: "Hi, how can I help?" } }],
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
        { type: "chat.part.text", props: { text: "Thinking…" } },
        { type: "custom", props: { label: "my-tool" } },
      ],
    };

    render(withRegistry(<Message message={message} />, { custom: eagerComponent(CustomPart) }));

    expect(screen.getByText("Thinking…")).toBeVisible();
    expect(screen.getByTestId("custom-part")).toHaveTextContent("my-tool");
  });

  it("flags an unknown part type as a missing component", () => {
    const message: ChatMessage = {
      id: "4",
      role: "user",
      parts: [{ type: "unknown-type-xyz", props: {} }],
    };

    const { container } = render(withRegistry(<Message message={message} />));
    const bubble = container.querySelector('[data-test="chat-message-user"]');
    expect(bubble).toBeInTheDocument();
    expect(
      bubble?.querySelector('[data-lattice-missing-component="unknown-type-xyz"]'),
    ).toBeInTheDocument();
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

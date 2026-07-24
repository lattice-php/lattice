import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createPlugin, createRegistry, eagerComponent } from "@lattice-php/lattice/core/registry";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import type { ChatMessage } from "@lattice-php/lattice/chat/types";
import { chatComponents } from "@lattice-php/lattice/chat/plugin";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import { Message } from "./message";

const CustomPart: RendererComponent = ({ node }) => (
  <span data-test="custom-part">{(node.props as { label: string }).label}</span>
);

const registry = createRegistry(chatComponents);
const customRegistry = createRegistry(
  chatComponents,
  createPlugin({ name: "test", components: { custom: eagerComponent(CustomPart) } }),
);

describe("Message", () => {
  it("renders a user message with its text part", () => {
    const message: ChatMessage = {
      id: "1",
      role: "user",
      parts: [{ type: "chat.part.text", props: { text: "Hello there" } }],
    };

    renderWithRegistry(<Message message={message} />, registry);

    expect(screen.getByText("Hello there")).toBeVisible();
    const messageWrapper = screen.getByTestId("chat-message-user");
    expect(messageWrapper).toBeInTheDocument();
    expect(messageWrapper.firstElementChild).toHaveClass("rounded-lt");
    expect(messageWrapper.firstElementChild).not.toHaveClass("rounded-lt-md");
  });

  it("renders an assistant message with its text part", () => {
    const message: ChatMessage = {
      id: "2",
      role: "assistant",
      parts: [{ type: "chat.part.text", props: { text: "Hi, how can I help?" } }],
    };

    renderWithRegistry(<Message message={message} />, registry);

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

    renderWithRegistry(<Message message={message} />, customRegistry);

    expect(screen.getByText("Thinking…")).toBeVisible();
    expect(screen.getByTestId("custom-part")).toHaveTextContent("my-tool");
  });

  it("flags an unknown part type as a missing component", () => {
    const message: ChatMessage = {
      id: "4",
      role: "user",
      parts: [{ type: "unknown-type-xyz", props: {} }],
    };

    const { container } = renderWithRegistry(<Message message={message} />, registry);
    const bubble = container.querySelector('[data-test="chat-message-user"]');
    expect(bubble).toBeInTheDocument();
    expect(
      bubble?.querySelector('[data-lattice-missing-component="unknown-type-xyz"]'),
    ).toBeInTheDocument();
  });
});

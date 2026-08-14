import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import type { RendererComponent } from "@lattice-php/core/types";
import type { ChatMessage } from "../types";
import chatPlugin from "../plugin";
import { renderWithRegistry } from "@lattice-php/core/test-support";
import { Message } from "./message";

const CustomPart: RendererComponent = ({ node }) => (
  <span data-test="custom-part">{(node.props as { label: string }).label}</span>
);

const customRegistry = createRegistry(chatPlugin, {
  name: "test",
  components: { custom: eagerComponent(CustomPart) },
});

describe("Message", () => {
  it("renders both a text part and a custom registered part", async () => {
    const message: ChatMessage = {
      id: "3",
      role: "assistant",
      parts: [
        { type: "chat.part.text", props: { text: "Thinking…" } },
        { type: "custom", props: { label: "my-tool" } },
      ],
    };

    renderWithRegistry(<Message message={message} />, customRegistry);

    expect(await screen.findByText("Thinking…")).toBeVisible();
    expect(screen.getByTestId("custom-part")).toHaveTextContent("my-tool");
  });
});

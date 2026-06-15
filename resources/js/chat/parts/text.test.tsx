import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getChatPart, registerChatPart } from "../part-registry";
import type { ChatPart, ChatPartComponent } from "../part-registry";
import "./text";

describe("part registry + TextPart", () => {
  it("pre-registers 'text' and renders the text", () => {
    const TextPart = getChatPart("text");
    expect(TextPart).toBeDefined();

    const part: ChatPart = { type: "text", text: "Hello, world!" };
    const Component = TextPart as ChatPartComponent;
    render(<Component part={part} />);

    expect(screen.getByText("Hello, world!")).toBeVisible();
  });

  it("registerChatPart overrides an existing type", () => {
    const CustomPart: ChatPartComponent = ({ part }) => (
      <div>custom: {(part as { type: string; text: string }).text}</div>
    );

    registerChatPart("text-override-test", CustomPart);

    const Retrieved = getChatPart("text-override-test") as ChatPartComponent;
    const part: ChatPart = { type: "text-override-test", text: "override" };
    render(<Retrieved part={part} />);

    expect(screen.getByText("custom: override")).toBeVisible();
  });

  it("getChatPart returns undefined for an unknown type", () => {
    expect(getChatPart("unknown-xyz")).toBeUndefined();
  });
});

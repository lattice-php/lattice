import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ChatPart } from "../part-registry";
import { ToolCallPart } from "./tool-call";

describe("ToolCallPart", () => {
  it("renders the tool name and serialized args", () => {
    const part: ChatPart = { type: "tool-call", name: "lookup", args: { query: "tables" } };

    render(<ToolCallPart part={part} />);

    const badge = screen.getByTestId("chat-tool-call");
    expect(badge).toBeVisible();
    expect(badge).toHaveTextContent('lookup({"query":"tables"})');
  });
});

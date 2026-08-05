import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { ToolCallPart } from "./tool-call";

describe("ToolCallPart", () => {
  it("renders the tool name and serialized args", () => {
    render(
      <ToolCallPart
        node={fakeNode({
          type: "chat.part.tool-call",
          props: { name: "lookup", args: { query: "tables" } },
        })}
      >
        {null}
      </ToolCallPart>,
    );

    const badge = screen.getByTestId("chat-tool-call");
    expect(badge).toBeVisible();
    expect(badge).toHaveTextContent('lookup({"query":"tables"})');
  });
});

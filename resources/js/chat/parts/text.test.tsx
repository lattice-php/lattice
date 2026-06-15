import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { TextPart } from "./text";

describe("TextPart", () => {
  it("renders the text of a text part", () => {
    render(
      <TextPart node={fakeNode({ type: "chat.part.text", props: { text: "Hello, world!" } })}>
        {null}
      </TextPart>,
    );

    expect(screen.getByText("Hello, world!")).toBeVisible();
  });
});

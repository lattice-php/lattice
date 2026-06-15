import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ChatPart } from "../part-registry";
import { TextPart } from "./text";

describe("TextPart", () => {
  it("renders the text of a text part", () => {
    const part: ChatPart = { type: "text", text: "Hello, world!" };

    render(<TextPart part={part} />);

    expect(screen.getByText("Hello, world!")).toBeVisible();
  });
});

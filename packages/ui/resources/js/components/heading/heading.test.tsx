import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Heading } from "./heading";

describe("Heading", () => {
  it("clamps levels below 1 to an h1", () => {
    render(<Heading level={0}>Title</Heading>);

    expect(screen.getByRole("heading", { level: 1 }).tagName).toBe("H1");
  });

  it("clamps levels above 6 to an h6", () => {
    render(<Heading level={9}>Title</Heading>);

    expect(screen.getByRole("heading", { level: 6 }).tagName).toBe("H6");
  });
});

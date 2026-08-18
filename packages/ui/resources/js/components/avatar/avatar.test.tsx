import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./avatar";

describe("Avatar", () => {
  it("renders the image when a source is provided", () => {
    render(<Avatar src="https://example.test/a.png" name="Ada Lovelace" />);

    const image = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(image.tagName).toBe("IMG");
    expect(image).toHaveAttribute("src", "https://example.test/a.png");
  });

  it("falls back to initials from the name when there is no source", () => {
    render(<Avatar name="Ada Lovelace" />);

    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("uses only the first two words for initials", () => {
    render(<Avatar name="Grace Brewster Hopper" />);

    expect(screen.getByText("GB")).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import type { Size } from "@lattice-php/lattice/types/generated";
import AvatarComponent from "./avatar";

function renderAvatar(props: { src?: string | null; name?: string | null; size?: Size }) {
  const node = fakeNode({
    type: "avatar",
    props: { src: null, name: null, size: "md", ...props },
  });
  return render(<AvatarComponent node={node}>{null}</AvatarComponent>);
}

describe("AvatarComponent", () => {
  it("renders the image when a source is provided", () => {
    renderAvatar({ src: "https://example.test/a.png", name: "Ada Lovelace" });

    const image = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(image.tagName).toBe("IMG");
    expect(image).toHaveAttribute("src", "https://example.test/a.png");
  });

  it("falls back to initials from the name when there is no source", () => {
    renderAvatar({ name: "Ada Lovelace" });

    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("uses only the first two words for initials", () => {
    renderAvatar({ name: "Grace Brewster Hopper" });

    expect(screen.getByText("GB")).toBeInTheDocument();
  });

  it("renders a neutral user glyph when neither source nor name is given", () => {
    const { container } = renderAvatar({});

    expect(screen.queryByRole("img")).not.toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });
});

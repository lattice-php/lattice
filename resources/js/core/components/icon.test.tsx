import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpriteProvider } from "@lattice-php/lattice";
import { fakeNode } from "@lattice-php/lattice/test-support";
import type { Color, Size } from "@lattice-php/lattice/types/generated";
import IconComponent from "./icon";

function renderIcon(props: {
  name: string;
  size: Size;
  color: Color | null;
  class: string | null;
}) {
  return render(
    <SpriteProvider sprite={{ href: "", ids: [props.name] }}>
      <IconComponent node={fakeNode({ type: "icon", props })}>{null}</IconComponent>
    </SpriteProvider>,
  );
}

describe("Lattice icon component", () => {
  it("maps size and colour to tokens and forwards the raw class", () => {
    const { container } = renderIcon({
      name: "house",
      size: "lg",
      color: "danger",
      class: "opacity-80",
    });

    expect(container.querySelector("svg")).toHaveClass(
      "size-lt-icon-lg",
      "text-lt-danger",
      "opacity-80",
    );
  });

  it("renders the md token and omits colour when unset", () => {
    const { container } = renderIcon({ name: "house", size: "md", color: null, class: null });
    const svg = container.querySelector("svg");

    expect(svg).toHaveClass("size-lt-icon-md");
    expect(svg).not.toHaveClass("text-lt-danger");
  });
});

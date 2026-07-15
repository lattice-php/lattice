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
      color: { kind: "named", value: "danger", dark: null },
      class: "opacity-80",
    });

    const svg = container.querySelector("svg");

    expect(svg).toHaveClass("size-lt-icon-lg", "opacity-80");
    // The sprite renderer applies size-lt-icon-md as a baseline; an explicit
    // size must override it rather than coexist with it.
    expect(svg).not.toHaveClass("size-lt-icon-md");

    const wrapper = container.querySelector("span.contents");
    expect(wrapper).not.toBeNull();
    expect(wrapper?.style.getPropertyValue("color")).toBe("var(--lt-color-danger)");
  });

  it.each(["2xl", "3xl", "4xl"] as const)("supports the %s display size", (size) => {
    const { container } = renderIcon({ name: "house", size, color: null, class: null });
    const svg = container.querySelector("svg");

    expect(svg).toHaveClass(`size-lt-icon-${size}`);
    expect(svg).not.toHaveClass("size-lt-icon-md");
  });

  it("renders the md token and omits colour when unset", () => {
    const { container } = renderIcon({ name: "house", size: "md", color: null, class: null });
    const svg = container.querySelector("svg");

    expect(svg).toHaveClass("size-lt-icon-md");
    expect(container.querySelector("span.contents")).toBeNull();
  });
});

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpriteProvider } from "@lattice-php/lattice";
import { fakeNode } from "@lattice-php/core/test-support";
import type { Color, Size } from "../generated";
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
  it("overrides the baseline size token and maps colour onto a wrapper", () => {
    const { container } = renderIcon({
      name: "house",
      size: "lg",
      color: { kind: "named", value: "danger", dark: null },
      class: "opacity-80",
    });

    // The sprite renderer applies size-lt-icon-md as a baseline; an explicit
    // size must override it rather than coexist with it.
    expect(container.querySelector("svg")).not.toHaveClass("size-lt-icon-md");

    const wrapper = container.querySelector<HTMLSpanElement>("span.contents");
    expect(wrapper).not.toBeNull();
    expect(wrapper?.style.getPropertyValue("color")).toBe("var(--lt-color-danger)");
  });

  it("omits the colour wrapper when no colour is set", () => {
    const { container } = renderIcon({ name: "house", size: "md", color: null, class: null });

    expect(container.querySelector("span.contents")).toBeNull();
  });
});

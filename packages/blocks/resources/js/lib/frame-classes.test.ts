import { describe, expect, it } from "vitest";
import { block, testStyleClasses } from "../test-support";
import { frameClasses } from "./frame-classes";

describe("frameClasses", () => {
  it("maps every set style value through the vocabulary and leaves unset ones out", () => {
    const styled = block(
      "s",
      "lattice.heading",
      {},
      {},
      {
        align: "center",
        background: "muted",
        hideOnMobile: true,
        marginBottom: "sm",
        paddingTop: "lg",
        width: "wide",
      },
    );

    expect(frameClasses(testStyleClasses, styled.style)).toEqual({
      inner: "mx-auto w-full max-w-6xl",
      outer: "mb-4 pt-12 bg-lt-muted text-lt-fg px-6 max-md:hidden text-center",
    });
    expect(frameClasses(testStyleClasses, block("e", "lattice.heading").style)).toEqual({
      inner: "w-full",
      outer: "",
    });
  });

  it("applies a theme's overrides without touching the rest of the map", () => {
    const themed = {
      ...testStyleClasses,
      background: { ...testStyleClasses.background, muted: "theme-muted" },
      backgroundPadding: "",
    };
    const style = block(
      "s",
      "lattice.heading",
      {},
      {},
      { background: "muted", paddingTop: "xs" },
    ).style;

    expect(frameClasses(themed, style).outer).toBe("pt-2 theme-muted");
    expect(frameClasses(themed, { ...style, background: "none" }).outer).toBe("pt-2");
  });
});

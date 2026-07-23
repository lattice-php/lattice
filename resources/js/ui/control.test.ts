import { describe, expect, it } from "vitest";
import { controlSurface, FOCUS_RING } from "./control";

describe("controlSurface", () => {
  it("shares the border and focus ring across densities", () => {
    const comfortable = controlSurface({ density: "comfortable" });
    const compact = controlSurface();

    for (const classes of [comfortable, compact]) {
      expect(classes).toContain("border-lt-input");
      expect(classes).toContain("focus-visible:ring-[length:var(--lt-ring-width)]");
    }
  });

  it("varies padding, text size, and background by density", () => {
    expect(controlSurface({ density: "comfortable" })).toContain("px-3");
    expect(controlSurface({ density: "comfortable" })).toContain("bg-transparent");
    expect(controlSurface({ density: "compact" })).toContain("px-2");
    expect(controlSurface({ density: "compact" })).toContain("bg-lt-bg");
  });

  it("exposes the focus ring constant", () => {
    expect(FOCUS_RING).toContain("focus-visible:border-lt-ring");
  });

  it("uses the ring-width token for the focus ring", () => {
    expect(FOCUS_RING).toContain("var(--lt-ring-width)");
  });
});

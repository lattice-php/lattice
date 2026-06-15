import { describe, expect, it } from "vitest";
import { alignJustify, alignJustifyItems, alignText } from "./align";

describe("column align classes", () => {
  it("maps logical alignment to static Tailwind classes", () => {
    expect(alignText("start")).toBe("text-start");
    expect(alignText("center")).toBe("text-center");
    expect(alignText("end")).toBe("text-end");
    expect(alignJustify("end")).toBe("justify-end");
    expect(alignJustifyItems("end")).toBe("justify-items-end");
  });
});

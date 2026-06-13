import { describe, expect, it } from "vitest";
import { buildColumnGridTemplate, columnWidthTrack, maxColumnWidthPx } from "./column-sizing";

describe("column sizing", () => {
  it("maps width tokens to stable grid tracks", () => {
    expect(columnWidthTrack("xs")).toBe("minmax(4rem, 0.35fr)");
    expect(columnWidthTrack("xl")).toBe("minmax(16rem, 2fr)");
  });

  it("builds a shared grid template with fixed utility tracks", () => {
    expect(
      buildColumnGridTemplate({
        columns: [
          { key: "qty", width: "xs" },
          { key: "description", width: "xl" },
        ],
        leadingTracks: ["3rem"],
        trailingTracks: ["3rem"],
      }),
    ).toBe("3rem minmax(4rem, 0.35fr) minmax(16rem, 2fr) 3rem");
  });

  it("exposes a maximum width for resize handles", () => {
    expect(maxColumnWidthPx({ key: "description", width: "xl" })).toBe(1024);
  });
});

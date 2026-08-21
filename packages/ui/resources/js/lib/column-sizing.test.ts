import { describe, expect, it } from "vitest";
import { buildColumnGridTemplate, buildPinnedOffsets, columnWidthTrack } from "./column-sizing";
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

  it("leaves the unpinned template byte-for-byte unchanged when overrides are present", () => {
    expect(
      buildColumnGridTemplate({
        columns: [
          { key: "qty", width: "xs" },
          { key: "description", width: "xl" },
        ],
        leadingTracks: ["3rem"],
        overrides: { qty: 200 },
      }),
    ).toBe("3rem 200px minmax(16rem, 2fr)");
  });

  it("switches every track to clamped px and inserts a filler before the first right-pinned column", () => {
    expect(
      buildColumnGridTemplate({
        columns: [
          { key: "name", pin: "left", width: "md" },
          { key: "description", width: "xl" },
          { key: "total", pin: "right", width: "xs" },
        ],
        leadingTracks: ["3rem"],
        trailingTracks: ["3rem"],
      }),
    ).toBe("3rem 176px 320px minmax(0, 1fr) 96px 3rem");
  });

  it("applies clamped overrides to pinned and unpinned columns alike", () => {
    expect(
      buildColumnGridTemplate({
        columns: [
          { key: "name", pin: "left", width: "md" },
          { key: "description", width: "xl" },
        ],
        overrides: { name: 50, description: 5000 },
      }),
    ).toBe("128px 1024px minmax(0, 1fr)");
  });

  it("appends the filler after the last column when nothing is pinned right", () => {
    expect(
      buildColumnGridTemplate({
        columns: [
          { key: "name", pin: "left", width: "md" },
          { key: "description", width: "xl" },
        ],
        trailingTracks: ["10rem"],
      }),
    ).toBe("176px 320px minmax(0, 1fr) 10rem");
  });

  describe("buildPinnedOffsets", () => {
    it("returns no offsets when nothing is pinned", () => {
      expect(
        buildPinnedOffsets({
          columns: [{ key: "name", width: "md" }],
          leadingTracks: ["2.5rem"],
        }),
      ).toEqual({});
    });

    it("offsets left-pinned columns from the leading tracks and preceding pinned widths", () => {
      expect(
        buildPinnedOffsets({
          columns: [
            { key: "name", pin: "left", width: "md" },
            { key: "email", pin: "left", width: "xl" },
            { key: "notes", width: "lg" },
          ],
          leadingTracks: ["2.5rem", "3rem"],
        }),
      ).toEqual({
        "--lt-pin-offset-0": "5.5rem",
        "--lt-pin-offset-1": "calc(5.5rem + 176px)",
      });
    });

    it("offsets right-pinned columns from the trailing tracks and following pinned widths", () => {
      expect(
        buildPinnedOffsets({
          columns: [
            { key: "name", width: "md" },
            { key: "total", pin: "right", width: "xs" },
            { key: "actions", pin: "right", width: "sm" },
          ],
          trailingTracks: ["10rem"],
        }),
      ).toEqual({
        "--lt-pin-offset-1": "calc(10rem + 128px)",
        "--lt-pin-offset-2": "10rem",
      });
    });

    it("applies resize overrides when computing pinned widths", () => {
      expect(
        buildPinnedOffsets({
          columns: [
            { key: "name", pin: "left", width: "md" },
            { key: "email", pin: "left", width: "xl" },
          ],
          overrides: { name: 50 },
        }),
      ).toEqual({
        "--lt-pin-offset-0": "0px",
        "--lt-pin-offset-1": "128px",
      });
    });

    it("emits utility offsets only for tracks that are present", () => {
      expect(
        buildPinnedOffsets({
          columns: [{ key: "name", pin: "left", width: "md" }],
          hasActions: true,
          hasExpander: true,
          hasSelection: true,
          leadingTracks: ["2.5rem", "3rem"],
          trailingTracks: ["10rem"],
        }),
      ).toEqual({
        "--lt-pin-offset-0": "5.5rem",
        "--lt-pin-offset-expander": "0px",
        "--lt-pin-offset-selection": "2.5rem",
        "--lt-pin-offset-actions": "0px",
      });
    });

    it("offsets the selection utility from 0px when no expander precedes it", () => {
      expect(
        buildPinnedOffsets({
          columns: [{ key: "name", pin: "left", width: "md" }],
          hasSelection: true,
          leadingTracks: ["3rem"],
        }),
      ).toEqual({
        "--lt-pin-offset-0": "3rem",
        "--lt-pin-offset-selection": "0px",
      });
    });
  });
});

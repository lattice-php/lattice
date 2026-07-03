import { describe, expect, it } from "vitest";
import type { NumberFormat } from "@lattice-php/lattice/types";
import { formatNumber } from "./number";

const base: NumberFormat = {
  kind: "number",
  notation: "standard",
  minimumFractionDigits: null,
  maximumFractionDigits: null,
  currency: null,
  unit: null,
};

describe("formatNumber", () => {
  it("formats compact currency in en-US", () => {
    expect(formatNumber(28000, { ...base, notation: "compact", currency: "USD" }, "en-US")).toBe(
      "$28K",
    );
  });

  it("applies fraction digits", () => {
    expect(
      formatNumber(
        1234.5,
        { ...base, minimumFractionDigits: 2, maximumFractionDigits: 2 },
        "en-US",
      ),
    ).toBe("1,234.50");
  });

  it("formats a percent unit", () => {
    expect(formatNumber(42, { ...base, unit: "percent" }, "en-US")).toBe("42%");
  });

  it("returns the raw string for non-numeric input", () => {
    expect(formatNumber("n/a", base, "en-US")).toBe("n/a");
  });
});

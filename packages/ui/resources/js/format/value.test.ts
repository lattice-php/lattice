import { describe, expect, it } from "vitest";
import type { DateFormat } from "../generated";
import { formatValue } from "./value";

const ctx = { locale: "en-US", timezone: "UTC" };

const month: DateFormat = {
  kind: "date",
  dateStyle: null,
  timeStyle: null,
  month: "short",
  year: null,
};

describe("formatValue", () => {
  it("returns the raw value with no format", () => {
    expect(formatValue(42, null, ctx)).toBe("42");
  });

  it("formats a month-only date via Intl field options", () => {
    expect(formatValue("2026-01-15", month, ctx)).toBe("Jan");
  });
});

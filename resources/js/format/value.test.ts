import { describe, expect, it } from "vitest";
import type { DateFormat, NumberFormat } from "@lattice-php/lattice/types/generated";
import { formatValue } from "./value";

const ctx = { locale: "en-US", timezone: "UTC" };

const number: NumberFormat = {
  kind: "number",
  notation: "compact",
  minimumFractionDigits: null,
  maximumFractionDigits: null,
  currency: "USD",
  unit: null,
};

const date: DateFormat = {
  kind: "date",
  dateStyle: "short",
  timeStyle: null,
  month: null,
  year: null,
};

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

  it("dispatches numbers to formatNumber", () => {
    expect(formatValue(28000, number, ctx)).toBe("$28K");
  });

  it("dispatches dates to formatDateValue", () => {
    expect(formatValue("2026-01-15", date, ctx)).toBe("1/15/26");
  });

  it("formats a month-only date via Intl field options", () => {
    expect(formatValue("2026-01-15", month, ctx)).toBe("Jan");
  });
});

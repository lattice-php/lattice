import { describe, expect, it } from "vitest";
import {
  formatDateTimeValue,
  formatDateValue,
  parseDateTimeValue,
  parseDateValue,
} from "./date-picker-value";

describe("date picker value helpers", () => {
  it("parses and formats date strings", () => {
    const value = parseDateValue("2026-06-19");

    expect(formatDateValue(value)).toBe("2026-06-19");
  });

  it("returns an empty date string for missing date values", () => {
    expect(formatDateValue(undefined)).toBe("");
    expect(formatDateValue(parseDateValue(""))).toBe("");
  });

  it("parses and formats datetime values with an IANA timezone", () => {
    const value = parseDateTimeValue("2026-06-19T14:30:00 Europe/Berlin", "UTC");

    expect(formatDateTimeValue(value, "Europe/Berlin")).toBe("2026-06-19T14:30:00 Europe/Berlin");
  });

  it("converts datetime values to the active timezone when formatting", () => {
    const value = parseDateTimeValue("2026-06-19T14:30:00 Europe/Berlin", "UTC");

    expect(formatDateTimeValue(value, "UTC")).toBe("2026-06-19T12:30:00 UTC");
  });

  it("treats bare datetime strings as values in the active timezone", () => {
    const value = parseDateTimeValue("2026-06-19T14:30:00", "Europe/Berlin");

    expect(formatDateTimeValue(value, "Europe/Berlin")).toBe("2026-06-19T14:30:00 Europe/Berlin");
  });
});

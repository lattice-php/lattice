import { describe, expect, it } from "vitest";
import {
  formatDateDisplayValue,
  formatDateTimeDisplayValue,
  formatDateTimeValue,
  formatDateValue,
  formatTimeInputValue,
  parseDateDisplayValue,
  parseDateTimeDisplayValue,
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

  it("rejects invalid date values", () => {
    expect(parseDateValue(null)).toBeUndefined();
    expect(parseDateValue("nope")).toBeUndefined();
  });

  it("parses and formats localized date values", () => {
    expect(formatDateValue(parseDateDisplayValue("06/19/2026", "en"))).toBe("2026-06-19");
    expect(formatDateValue(parseDateDisplayValue("19.06.2026", "de"))).toBe("2026-06-19");
  });

  it("returns an empty localized date string for missing values", () => {
    expect(formatDateDisplayValue(undefined, "en")).toBe("");
    expect(parseDateDisplayValue("nope", "en")).toBeUndefined();
  });

  it("formats date values for the active locale", () => {
    const value = parseDateValue("2026-06-19");

    expect(formatDateDisplayValue(value, "de")).toBe("19.06.2026");
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

  it("parses absolute datetime values into the active timezone", () => {
    const value = parseDateTimeValue("2026-06-19T12:30:00Z", "Europe/Berlin");

    expect(formatDateTimeValue(value, "Europe/Berlin")).toBe("2026-06-19T14:30:00 Europe/Berlin");
  });

  it("rejects invalid datetime values", () => {
    expect(parseDateTimeValue(null, "UTC")).toBeUndefined();
    expect(parseDateTimeValue("nope", "UTC")).toBeUndefined();
    expect(parseDateTimeValue("2026-06-19T14:30:00 Nope/Nowhere", "UTC")).toBeUndefined();
  });

  it("parses localized datetime values", () => {
    const value = parseDateTimeDisplayValue("19.06.2026, 14:30", "de", "Europe/Berlin");

    expect(formatDateTimeValue(value, "Europe/Berlin")).toBe("2026-06-19T14:30:00 Europe/Berlin");
  });

  it("requires time parts for localized datetime values", () => {
    expect(parseDateTimeDisplayValue("19.06.2026", "de", "Europe/Berlin")).toBeUndefined();
  });

  it("returns an empty localized datetime string for missing values", () => {
    expect(formatDateTimeDisplayValue(undefined, "de", "Europe/Berlin")).toBe("");
  });

  it("formats datetime values for the active locale and timezone", () => {
    const value = parseDateTimeValue("2026-06-19T14:30:00 Europe/Berlin", "UTC");

    expect(formatDateTimeDisplayValue(value, "de", "Europe/Berlin")).toBe("19.06.2026, 14:30");
  });

  it("formats native time input values in the active timezone", () => {
    const value = parseDateTimeValue("2026-06-19T14:30:15 Europe/Berlin", "UTC");

    expect(formatTimeInputValue(value, "Europe/Berlin")).toBe("14:30:15");
    expect(formatTimeInputValue(undefined, "Europe/Berlin")).toBe("");
  });
});

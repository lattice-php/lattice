import { describe, expect, it } from "vitest";
import { formatDateValue, preciseDateTime, toDate } from "./date-time";

describe("toDate", () => {
  it("parses an ISO string", () => {
    expect(toDate("2026-06-18T00:30:00Z")).toEqual(new Date("2026-06-18T00:30:00Z"));
  });

  it("parses a numeric timestamp", () => {
    const timestamp = new Date("2026-06-18T00:30:00Z").getTime();

    expect(toDate(timestamp)).toEqual(new Date(timestamp));
  });

  it("passes through a valid Date instance", () => {
    const date = new Date("2026-06-18T00:30:00Z");

    expect(toDate(date)).toBe(date);
  });

  it("returns null for an unparseable string", () => {
    expect(toDate("not-a-date")).toBeNull();
  });

  it("returns null for an invalid Date instance", () => {
    expect(toDate(new Date("not-a-date"))).toBeNull();
  });

  it("returns null for null", () => {
    expect(toDate(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(toDate(undefined)).toBeNull();
  });

  it("returns null for a plain object", () => {
    expect(toDate({})).toBeNull();
  });

  it("returns null for a boolean", () => {
    expect(toDate(true)).toBeNull();
  });
});

describe("preciseDateTime", () => {
  it("includes the IANA zone id and a year", () => {
    const text = preciseDateTime("2026-06-18T00:30:00Z", {
      locale: "en-GB",
      timeZone: "Europe/Berlin",
    });

    expect(text).toContain("2026");
    expect(text).toContain("Europe/Berlin");
  });

  it("formats a Date instance the same as its equivalent ISO string", () => {
    const options = { locale: "en-GB", timeZone: "UTC" };

    expect(preciseDateTime(new Date("2026-06-18T00:30:00Z"), options)).toBe(
      preciseDateTime("2026-06-18T00:30:00Z", options),
    );
  });

  it("returns an empty string for an invalid value", () => {
    expect(preciseDateTime("not-a-date", { timeZone: "UTC" })).toBe("");
  });

  it("returns an empty string for an invalid Date instance", () => {
    expect(preciseDateTime(new Date("not-a-date"), { timeZone: "UTC" })).toBe("");
  });

  it("returns an empty string for null, undefined, and an empty string", () => {
    expect(preciseDateTime(null, { timeZone: "UTC" })).toBe("");
    expect(preciseDateTime(undefined, { timeZone: "UTC" })).toBe("");
    expect(preciseDateTime("", { timeZone: "UTC" })).toBe("");
  });

  it("returns an empty string for an object or a boolean", () => {
    expect(preciseDateTime({}, { timeZone: "UTC" })).toBe("");
    expect(preciseDateTime(true, { timeZone: "UTC" })).toBe("");
  });
});

describe("formatDateValue", () => {
  it("returns the raw value when the date cannot be parsed", () => {
    expect(formatDateValue("not-a-date", { dateStyle: "medium", timeStyle: null })).toBe(
      "not-a-date",
    );
  });

  it("applies only the styles that are configured", () => {
    const dateOnly = formatDateValue(
      "2026-06-18T00:30:00Z",
      { dateStyle: "short", timeStyle: null },
      {
        locale: "en-GB",
        timeZone: "UTC",
      },
    );
    const timeOnly = formatDateValue(
      "2026-06-18T00:30:00Z",
      { dateStyle: null, timeStyle: "short" },
      {
        locale: "en-GB",
        timeZone: "UTC",
      },
    );

    expect(dateOnly).toContain("2026");
    expect(timeOnly).toContain("00:30");
  });

  it("formats a Date instance the same as its equivalent ISO string", () => {
    const config = { dateStyle: "medium" as const, timeStyle: "short" as const };
    const options = { locale: "en-GB", timeZone: "UTC" };

    expect(formatDateValue(new Date("2026-06-18T00:30:00Z"), config, options)).toBe(
      formatDateValue("2026-06-18T00:30:00Z", config, options),
    );
  });

  it("formats a numeric timestamp instead of degrading to its stringified digits", () => {
    const timestamp = new Date("2026-06-18T00:30:00Z").getTime();

    const formatted = formatDateValue(
      timestamp,
      { dateStyle: "medium", timeStyle: null },
      { locale: "en-GB", timeZone: "UTC" },
    );

    expect(formatted).toBe(
      formatDateValue(
        "2026-06-18T00:30:00Z",
        { dateStyle: "medium", timeStyle: null },
        { locale: "en-GB", timeZone: "UTC" },
      ),
    );
    expect(formatted).not.toBe(String(timestamp));
  });

  it("returns the raw value for an invalid Date instance", () => {
    const invalid = new Date("not-a-date");

    expect(formatDateValue(invalid, { dateStyle: "medium", timeStyle: null })).toBe(
      String(invalid),
    );
  });

  it("degrades to an empty string for null, undefined, and an empty string", () => {
    const config = { dateStyle: "medium" as const, timeStyle: null };

    expect(formatDateValue(null, config)).toBe("");
    expect(formatDateValue(undefined, config)).toBe("");
    expect(formatDateValue("", config)).toBe("");
  });

  it("degrades to String(value) for an object or a boolean", () => {
    const config = { dateStyle: "medium" as const, timeStyle: null };

    expect(formatDateValue({}, config)).toBe("[object Object]");
    expect(formatDateValue(true, config)).toBe("true");
    expect(formatDateValue(false, config)).toBe("false");
  });
});

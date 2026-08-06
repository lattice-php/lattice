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

  it.each([
    ["an unparseable string", "not-a-date"],
    ["an invalid Date instance", new Date("not-a-date")],
    ["null", null],
    ["undefined", undefined],
    ["a plain object", {}],
    ["a boolean", true],
  ])("returns null for %s", (_label, value) => {
    expect(toDate(value)).toBeNull();
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

  it.each([
    ["an unparseable string", "not-a-date"],
    ["an invalid Date instance", new Date("not-a-date")],
    ["null", null],
    ["undefined", undefined],
    ["an empty string", ""],
    ["a plain object", {}],
    ["a boolean", true],
  ])("returns an empty string for %s", (_label, value) => {
    expect(preciseDateTime(value, { timeZone: "UTC" })).toBe("");
  });
});

describe("formatDateValue", () => {
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

  it.each([
    ["an unparseable string", "not-a-date", "not-a-date"],
    ["an invalid Date instance", new Date("not-a-date"), String(new Date("not-a-date"))],
    ["null", null, ""],
    ["undefined", undefined, ""],
    ["an empty string", "", ""],
    ["a plain object", {}, "[object Object]"],
    ["a boolean", true, "true"],
  ])("degrades %s to its raw representation", (_label, value, expected) => {
    expect(formatDateValue(value, { dateStyle: "medium", timeStyle: null })).toBe(expected);
  });
});

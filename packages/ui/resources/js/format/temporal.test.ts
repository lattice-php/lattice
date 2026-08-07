import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addDays,
  daysBetween,
  formatDateValue,
  isoWeek,
  preciseDateTime,
  toDate,
  todayISO,
} from "./temporal";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("isoWeek", () => {
  it("resolves the last days of 2026 into ISO week 53, not week 1 of 2027", () => {
    expect(isoWeek("2026-12-28")).toBe(53);
    expect(isoWeek("2026-12-31")).toBe(53);
    expect(isoWeek("2027-01-01")).toBe(53);
    expect(isoWeek("2027-01-04")).toBe(1);
  });
});

describe("addDays / daysBetween", () => {
  it("round-trip for negative, zero, and positive offsets", () => {
    const start = "2026-06-15";

    for (const offset of [-40, -1, 0, 1, 40]) {
      expect(daysBetween(start, addDays(start, offset))).toBe(offset);
    }
  });

  it("does not shift the day index across a Europe/Berlin DST transition", () => {
    vi.stubEnv("TZ", "Europe/Berlin");

    // Clocks spring forward in Berlin on the last Sunday of March; a UTC-noon
    // day count must still see plain calendar days regardless.
    expect(daysBetween("2027-03-01", "2027-04-01")).toBe(31);
    expect(addDays("2027-03-26", 5)).toBe("2027-03-31");
    expect(daysBetween("2027-03-26", "2027-03-31")).toBe(5);
  });
});

describe("todayISO", () => {
  it("resolves the calendar date independently per IANA zone", () => {
    // At 2026-06-18T00:30:00Z, Kiritimati (UTC+14) already reads 2026-06-18
    // while Midway (UTC-11) is still on 2026-06-17 — a UTC-anchored `today`
    // would get at least one of these zones wrong at this instant.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-18T00:30:00Z"));

    expect(todayISO("Pacific/Kiritimati")).toBe("2026-06-18");
    expect(todayISO("Pacific/Midway")).toBe("2026-06-17");
  });
});

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

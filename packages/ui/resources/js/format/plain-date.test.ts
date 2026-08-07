import { afterEach, describe, expect, it, vi } from "vitest";
import { addDays, daysBetween, isoWeek, todayISO } from "./plain-date";

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

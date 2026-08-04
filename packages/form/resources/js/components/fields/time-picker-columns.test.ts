import { describe, expect, it } from "vitest";
import {
  buildTimeColumns,
  formatTimeValue,
  parseTimeString,
  secondsEnabled,
} from "./time-picker-columns";

describe("parseTimeString", () => {
  it("parses HH:MM and HH:MM:SS", () => {
    expect(parseTimeString("14:30")).toEqual({ hour: 14, minute: 30, second: 0 });
    expect(parseTimeString("14:30:15")).toEqual({ hour: 14, minute: 30, second: 15 });
  });

  it("returns null for empty or out-of-range input", () => {
    expect(parseTimeString("")).toBeNull();
    expect(parseTimeString(null)).toBeNull();
    expect(parseTimeString("24:00")).toBeNull();
    expect(parseTimeString("12:60")).toBeNull();
    expect(parseTimeString("nope")).toBeNull();
  });
});

describe("formatTimeValue", () => {
  it("pads and optionally includes seconds", () => {
    expect(formatTimeValue({ hour: 9, minute: 5, second: 0 }, false)).toBe("09:05");
    expect(formatTimeValue({ hour: 9, minute: 5, second: 7 }, true)).toBe("09:05:07");
  });
});

describe("secondsEnabled", () => {
  it("is true only for sub-minute steps", () => {
    expect(secondsEnabled(null)).toBe(false);
    expect(secondsEnabled(60)).toBe(false);
    expect(secondsEnabled(30)).toBe(true);
  });
});

describe("buildTimeColumns", () => {
  it("defaults to 24 hours, 60 minutes, no seconds", () => {
    const columns = buildTimeColumns(null);

    expect(columns.hours).toHaveLength(24);
    expect(columns.minutes).toHaveLength(60);
    expect(columns.seconds).toBeNull();
    expect(columns.hours[0]).toEqual({ value: 0, label: "00", disabled: false });
  });

  it("derives the minute list from a minute-granularity step", () => {
    const columns = buildTimeColumns(900);

    expect(columns.minutes.map((option) => option.value)).toEqual([0, 15, 30, 45]);
  });

  it("shows a seconds column for sub-minute steps", () => {
    const columns = buildTimeColumns(30);

    expect(columns.seconds).not.toBeNull();
    expect(columns.seconds).toHaveLength(60);
    expect(columns.minutes).toHaveLength(60);
  });

  it("keeps an off-step current minute in the list", () => {
    const columns = buildTimeColumns(900, { current: { hour: 0, minute: 7, second: 0 } });

    expect(columns.minutes.map((option) => option.value)).toContain(7);
  });

  it("disables hours outside min/max", () => {
    const columns = buildTimeColumns(null, {
      min: "08:00",
      max: "18:00",
      current: { hour: 8, minute: 0, second: 0 },
    });

    expect(columns.hours.find((option) => option.value === 7)?.disabled).toBe(true);
    expect(columns.hours.find((option) => option.value === 8)?.disabled).toBe(false);
    expect(columns.hours.find((option) => option.value === 19)?.disabled).toBe(true);
  });

  it("disables out-of-range minutes in a boundary hour", () => {
    const columns = buildTimeColumns(null, {
      min: "08:30",
      current: { hour: 8, minute: 45, second: 0 },
    });

    expect(columns.minutes.find((option) => option.value === 15)?.disabled).toBe(true);
    expect(columns.minutes.find((option) => option.value === 30)?.disabled).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { buildMonthGrid, capLanes, eventsOnDay, weekChips } from "./month-grid";
import { calendarEvent } from "./test-support";

describe("buildMonthGrid", () => {
  it("starts weeks on the locale's first weekday", () => {
    // August 2026 starts on a Saturday.
    const sundayStart = buildMonthGrid("2026-08-01", "en-US", "2026-08-15");
    const mondayStart = buildMonthGrid("2026-08-01", "de-DE", "2026-08-15");

    expect(sundayStart.gridStart).toBe("2026-07-26");
    expect(mondayStart.gridStart).toBe("2026-07-27");
  });

  it("emits only the week rows the month spans in the locale", () => {
    // February 2026 starts on a Sunday and has exactly 28 days.
    expect(buildMonthGrid("2026-02-01", "en-US", "2026-08-15").weeks).toHaveLength(4);
    expect(buildMonthGrid("2026-02-01", "de-DE", "2026-08-15").weeks).toHaveLength(5);
    expect(buildMonthGrid("2026-08-01", "en-US", "2026-08-15").weeks).toHaveLength(6);
  });

  it("marks leading and trailing days as outside the month", () => {
    const grid = buildMonthGrid("2026-08-01", "en-US", "2026-08-15");
    const firstWeek = grid.weeks[0].days;
    const lastWeek = grid.weeks[grid.weeks.length - 1].days;

    expect(firstWeek.map((day) => day.inMonth)).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      true,
    ]);
    expect(lastWeek.some((day) => !day.inMonth)).toBe(true);
    expect(grid.weeks.flatMap((week) => week.days).filter((day) => day.inMonth)).toHaveLength(31);
  });

  it("marks today and weekends", () => {
    const grid = buildMonthGrid("2026-08-01", "en-US", "2026-08-15");
    const today = grid.weeks.flatMap((week) => week.days).find((day) => day.isToday);

    // 2026-08-15 is a Saturday.
    expect(today?.date).toBe("2026-08-15");
    expect(today?.isWeekend).toBe(true);
  });
});

describe("weekChips", () => {
  const week = "2026-08-09";

  it("clips a multi-week event to the week and flags its continuation", () => {
    const { chips } = weekChips(
      [calendarEvent({ id: "long", start: "2026-08-05", end: "2026-08-20" })],
      week,
    );

    expect(chips).toEqual([
      expect.objectContaining({
        id: "long",
        start: 0,
        span: 7,
        continuesBefore: true,
        continuesAfter: true,
      }),
    ]);
  });

  it("ignores events outside the week", () => {
    const { chips } = weekChips(
      [
        calendarEvent({ id: "before", start: "2026-08-01", end: "2026-08-09" }),
        calendarEvent({ id: "after", start: "2026-08-16", end: "2026-08-17" }),
      ],
      week,
    );

    expect(chips).toEqual([]);
  });

  it("stacks overlapping events into deterministic lanes", () => {
    const events = [
      calendarEvent({ id: "b", start: "2026-08-10", end: "2026-08-12" }),
      calendarEvent({ id: "a", start: "2026-08-10", end: "2026-08-12" }),
      calendarEvent({ id: "c", start: "2026-08-12", end: "2026-08-13" }),
    ];

    const { chips, laneCount } = weekChips(events, week);
    const lanes = Object.fromEntries(chips.map((chip) => [chip.id, chip.lane]));

    expect(lanes).toEqual({ a: 0, b: 1, c: 0 });
    expect(laneCount).toBe(2);
    expect(weekChips([...events].reverse(), week).chips).toEqual(chips);
  });

  it("stacks a day's chips all-day first, then by wall-clock time", () => {
    const { chips } = weekChips(
      [
        calendarEvent({
          id: "afternoon",
          start: "2026-08-11T15:00:00",
          end: "2026-08-11T16:00:00",
          allDay: false,
        }),
        calendarEvent({
          id: "morning",
          start: "2026-08-11T09:00:00",
          end: "2026-08-11T10:00:00",
          allDay: false,
        }),
        calendarEvent({ id: "z-all-day", start: "2026-08-11", end: "2026-08-12" }),
      ],
      week,
    );

    const lanes = Object.fromEntries(chips.map((chip) => [chip.id, chip.lane]));

    expect(lanes).toEqual({ "z-all-day": 0, morning: 1, afternoon: 2 });
  });

  it("places a timed event on its start day column", () => {
    const { chips } = weekChips(
      [
        calendarEvent({
          id: "timed",
          start: "2026-08-11T09:00:00",
          end: "2026-08-11T10:00:00",
          allDay: false,
        }),
      ],
      week,
    );

    expect(chips).toEqual([
      expect.objectContaining({
        id: "timed",
        start: 2,
        span: 1,
        continuesBefore: false,
        continuesAfter: false,
      }),
    ]);
  });
});

describe("capLanes", () => {
  it("hides chips beyond the visible lanes and counts them per day", () => {
    const week = "2026-08-09";
    const { chips } = weekChips(
      [
        calendarEvent({ id: "a", start: "2026-08-10", end: "2026-08-13" }),
        calendarEvent({ id: "b", start: "2026-08-10", end: "2026-08-12" }),
        calendarEvent({ id: "c", start: "2026-08-10", end: "2026-08-11" }),
        calendarEvent({ id: "d", start: "2026-08-10", end: "2026-08-11" }),
        calendarEvent({ id: "e", start: "2026-08-11", end: "2026-08-13" }),
      ],
      week,
    );

    const { visible, hiddenByDay } = capLanes(chips, 3);

    expect(visible.map((chip) => chip.id).sort()).toEqual(["a", "b", "c", "e"]);
    expect(hiddenByDay).toEqual([0, 1, 0, 0, 0, 0, 0]);
  });
});

describe("eventsOnDay", () => {
  it("returns the day's events with all-day spans first", () => {
    const events = [
      calendarEvent({
        id: "late",
        start: "2026-08-10T15:00:00",
        end: "2026-08-10T16:00:00",
        allDay: false,
      }),
      calendarEvent({ id: "span", start: "2026-08-08", end: "2026-08-12" }),
      calendarEvent({
        id: "early",
        start: "2026-08-10T09:00:00",
        end: "2026-08-10T10:00:00",
        allDay: false,
      }),
      calendarEvent({ id: "other-day", start: "2026-08-11", end: "2026-08-12" }),
    ];

    expect(eventsOnDay(events, "2026-08-10").map((event) => event.id)).toEqual([
      "span",
      "early",
      "late",
    ]);
  });
});

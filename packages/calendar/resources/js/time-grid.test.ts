import { describe, expect, it } from "vitest";
import {
  belongsInAllDayRow,
  eventDurationMinutes,
  layoutDayColumns,
  minuteToWallTime,
  snapMinute,
  timedSegmentsOnDay,
} from "./time-grid";
import { calendarEvent } from "./test-support";

function timed(id: string, start: string, end: string) {
  return calendarEvent({ id, start, end, allDay: false });
}

describe("belongsInAllDayRow", () => {
  it("routes all-day and multi-day events to the all-day row", () => {
    expect(belongsInAllDayRow(calendarEvent({ start: "2026-08-10", end: "2026-08-11" }))).toBe(
      true,
    );
    expect(belongsInAllDayRow(timed("e", "2026-08-10T22:00:00", "2026-08-11T02:00:00"))).toBe(true);
  });

  it("keeps single-day timed events in the grid, midnight end included", () => {
    expect(belongsInAllDayRow(timed("e", "2026-08-10T09:00:00", "2026-08-10T10:00:00"))).toBe(
      false,
    );
    expect(belongsInAllDayRow(timed("e", "2026-08-10T22:00:00", "2026-08-11T00:00:00"))).toBe(
      false,
    );
  });
});

describe("timedSegmentsOnDay", () => {
  it("returns minute spans for the day's single-day timed events", () => {
    const events = [
      timed("morning", "2026-08-10T09:00:00", "2026-08-10T10:30:00"),
      timed("other-day", "2026-08-11T09:00:00", "2026-08-11T10:00:00"),
      timed("to-midnight", "2026-08-10T22:00:00", "2026-08-11T00:00:00"),
      calendarEvent({ id: "all-day", start: "2026-08-10", end: "2026-08-11" }),
    ];

    const segments = timedSegmentsOnDay(events, "2026-08-10");

    expect(segments).toEqual([
      { event: events[0], startMin: 540, endMin: 630 },
      { event: events[2], startMin: 1320, endMin: 1440 },
    ]);
  });
});

describe("eventDurationMinutes", () => {
  it("measures wall-clock duration, across midnight included", () => {
    expect(eventDurationMinutes({ start: "2026-08-10T09:00:00", end: "2026-08-10T10:30:00" })).toBe(
      90,
    );
    expect(eventDurationMinutes({ start: "2026-08-10T22:00:00", end: "2026-08-11T00:00:00" })).toBe(
      120,
    );
  });
});

describe("layoutDayColumns", () => {
  const segment = (id: string, startMin: number, endMin: number) => ({
    event: calendarEvent({ id }),
    startMin,
    endMin,
  });

  it("gives non-overlapping segments the full width", () => {
    const placed = layoutDayColumns([segment("a", 0, 60), segment("b", 60, 120)]);

    expect(placed.map(({ event, column, columns }) => [event.id, column, columns])).toEqual([
      ["a", 0, 1],
      ["b", 0, 1],
    ]);
  });

  it("splits transitively overlapping segments into equal columns", () => {
    const placed = layoutDayColumns([
      segment("a", 0, 120),
      segment("b", 60, 180),
      segment("c", 130, 200),
    ]);

    expect(placed.map(({ event, column, columns }) => [event.id, column, columns])).toEqual([
      ["a", 0, 2],
      ["b", 1, 2],
      ["c", 0, 2],
    ]);
  });

  it("starts a fresh cluster once every prior segment has ended", () => {
    const placed = layoutDayColumns([
      segment("a", 0, 60),
      segment("b", 30, 90),
      segment("c", 90, 150),
    ]);

    expect(placed.map(({ event, column, columns }) => [event.id, column, columns])).toEqual([
      ["a", 0, 2],
      ["b", 1, 2],
      ["c", 0, 1],
    ]);
  });
});

describe("snapMinute", () => {
  it("rounds to the 15-minute grid and clamps into the day", () => {
    expect(snapMinute(7)).toBe(0);
    expect(snapMinute(8)).toBe(15);
    expect(snapMinute(-20)).toBe(0);
    expect(snapMinute(1500)).toBe(1440);
  });

  it("keeps a span inside the day", () => {
    expect(snapMinute(1400, 90)).toBe(1350);
  });
});

describe("minuteToWallTime", () => {
  it("formats a day-local minute as a wire datetime", () => {
    expect(minuteToWallTime("2026-08-10", 0)).toBe("2026-08-10T00:00:00");
    expect(minuteToWallTime("2026-08-10", 570)).toBe("2026-08-10T09:30:00");
  });

  it("rolls minute 1440 over to the next day's midnight", () => {
    expect(minuteToWallTime("2026-08-10", 1440)).toBe("2026-08-11T00:00:00");
  });
});

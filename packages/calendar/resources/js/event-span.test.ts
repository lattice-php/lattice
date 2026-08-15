import { describe, expect, it } from "vitest";
import { eventDaySpan, shiftEventDays } from "./event-span";

describe("eventDaySpan", () => {
  it("passes an all-day span through unchanged", () => {
    expect(eventDaySpan({ start: "2026-08-10", end: "2026-08-13", allDay: true })).toEqual([
      "2026-08-10",
      "2026-08-13",
    ]);
  });

  it("occupies the end's calendar day for a timed event", () => {
    expect(
      eventDaySpan({ start: "2026-08-10T09:00:00", end: "2026-08-11T17:30:00", allDay: false }),
    ).toEqual(["2026-08-10", "2026-08-12"]);
  });

  it("treats an exact-midnight end as the exclusive day bound", () => {
    expect(
      eventDaySpan({ start: "2026-08-10T22:00:00", end: "2026-08-11T00:00:00", allDay: false }),
    ).toEqual(["2026-08-10", "2026-08-11"]);
  });

  it("spans at least one day for a same-day timed event", () => {
    expect(
      eventDaySpan({ start: "2026-08-10T09:00:00", end: "2026-08-10T10:00:00", allDay: false }),
    ).toEqual(["2026-08-10", "2026-08-11"]);
  });
});

describe("shiftEventDays", () => {
  it("moves all-day bounds as dates", () => {
    expect(shiftEventDays({ start: "2026-08-10", end: "2026-08-13" }, 3)).toEqual({
      start: "2026-08-13",
      end: "2026-08-16",
    });
  });

  it("keeps a timed event's wall-clock times across a month boundary", () => {
    expect(shiftEventDays({ start: "2026-08-30T09:15:00", end: "2026-08-31T17:30:00" }, 7)).toEqual(
      { start: "2026-09-06T09:15:00", end: "2026-09-07T17:30:00" },
    );
  });

  it("shifts backwards", () => {
    expect(
      shiftEventDays({ start: "2026-08-10T09:00:00", end: "2026-08-10T10:00:00" }, -1),
    ).toEqual({ start: "2026-08-09T09:00:00", end: "2026-08-09T10:00:00" });
  });
});

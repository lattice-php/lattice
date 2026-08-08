import { describe, expect, it } from "vitest";
import { assignLanes, buildAxis } from "./date-axis";

describe("buildAxis", () => {
  it("splits the months row at a year boundary", () => {
    const axis = buildAxis("2026-12-30", 10, "en-US", "2026-12-30");

    expect(axis.months).toEqual([
      { start: 0, span: 2, label: "December 2026" },
      { start: 2, span: 8, label: "January 2027" },
    ]);
  });

  it("clips the weeks row at the axis edges instead of merging across the boundary", () => {
    // Real ISO week 53 (2026-12-28..2027-01-03) starts two days before this
    // axis, and real week 1 (2027-01-04..2027-01-10) ends two days after it.
    const axis = buildAxis("2026-12-30", 10, "en-US", "2026-12-30");

    expect(axis.weeks).toEqual([
      { start: 0, span: 5, label: "53" },
      { start: 5, span: 5, label: "1" },
    ]);
  });

  it("flags weekends and the caller-supplied today", () => {
    const axis = buildAxis("2026-12-30", 10, "en-US", "2027-01-01");

    // index 2 = 2027-01-01 (Friday, "today"), index 3 = Saturday, index 4 = Sunday.
    expect(axis.days[2]).toMatchObject({ date: "2027-01-01", isWeekend: false, isToday: true });
    expect(axis.days[3]).toMatchObject({ date: "2027-01-02", isWeekend: true, isToday: false });
    expect(axis.days[4]).toMatchObject({ date: "2027-01-03", isWeekend: true, isToday: false });
    expect(axis.days[0]).toMatchObject({ isWeekend: false, isToday: false });
  });
});

describe("assignLanes", () => {
  it("keeps non-overlapping bars in a single lane", () => {
    const { bars, laneCount } = assignLanes([
      { id: "a", start: 0, span: 2 },
      { id: "b", start: 2, span: 2 },
      { id: "c", start: 5, span: 1 },
    ]);

    expect(laneCount).toBe(1);
    expect(bars.map((bar) => bar.lane)).toEqual([0, 0, 0]);
  });

  it("stacks a chain of overlapping bars into separate lanes", () => {
    const { bars, laneCount } = assignLanes([
      { id: "a", start: 0, span: 3 },
      { id: "b", start: 1, span: 3 },
      { id: "c", start: 2, span: 3 },
    ]);
    const laneOf = (id: string) => bars.find((bar) => bar.id === id)?.lane;

    expect(laneCount).toBe(3);
    expect(laneOf("a")).toBe(0);
    expect(laneOf("b")).toBe(1);
    expect(laneOf("c")).toBe(2);
  });

  it("breaks equal-start ties deterministically by span then id", () => {
    const first = assignLanes([
      { id: "b", start: 0, span: 1 },
      { id: "a", start: 0, span: 2 },
    ]);
    const second = assignLanes([
      { id: "b", start: 0, span: 1 },
      { id: "a", start: 0, span: 2 },
    ]);

    expect(first.bars.find((bar) => bar.id === "a")?.lane).toBe(0);
    expect(first.bars.find((bar) => bar.id === "b")?.lane).toBe(1);
    expect(second).toEqual(first);
  });

  it("does not treat a bar ending where the next starts as an overlap", () => {
    const { bars, laneCount } = assignLanes([
      { id: "a", start: 0, span: 2 },
      { id: "b", start: 2, span: 2 },
    ]);

    expect(laneCount).toBe(1);
    expect(bars.every((bar) => bar.lane === 0)).toBe(true);
  });
});

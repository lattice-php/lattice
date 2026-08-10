import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@lattice-php/core/test-support";
import { mergeRanges, uncoveredGaps, useTimelineEvents } from "./timeline-state";
import type { TimelineEventData } from "./types";

describe("mergeRanges", () => {
  it("leaves disjoint ranges apart", () => {
    expect(
      mergeRanges([
        ["2026-01-01", "2026-01-05"],
        ["2026-02-01", "2026-02-05"],
      ]),
    ).toEqual([
      ["2026-01-01", "2026-01-05"],
      ["2026-02-01", "2026-02-05"],
    ]);
  });

  it("coalesces touching ranges into one", () => {
    expect(
      mergeRanges([
        ["2026-01-01", "2026-01-05"],
        ["2026-01-05", "2026-01-10"],
      ]),
    ).toEqual([["2026-01-01", "2026-01-10"]]);
  });

  it("coalesces overlapping and out-of-order ranges", () => {
    expect(
      mergeRanges([
        ["2026-01-03", "2026-01-06"],
        ["2026-01-01", "2026-01-10"],
      ]),
    ).toEqual([["2026-01-01", "2026-01-10"]]);
  });
});

describe("uncoveredGaps", () => {
  const d1 = "2026-01-01";
  const d2 = "2026-01-05";
  const d3 = "2026-01-10";
  const d4 = "2026-01-15";

  it("reports the whole query as a gap when disjoint from what's loaded", () => {
    expect(uncoveredGaps([[d1, d2]], d3, d4)).toEqual([[d3, d4]]);
  });

  it("reports the whole query as a gap when it only touches a loaded range", () => {
    expect(uncoveredGaps([[d1, d2]], d2, d3)).toEqual([[d2, d3]]);
  });

  it("reports no gap when the query is fully contained in a loaded range", () => {
    expect(uncoveredGaps([[d1, d4]], d2, d3)).toEqual([]);
  });

  it("reports only the gap between two loaded ranges spanning the query", () => {
    expect(
      uncoveredGaps(
        [
          [d1, d2],
          [d3, d4],
        ],
        d1,
        d4,
      ),
    ).toEqual([[d2, d3]]);
  });
});

function fakeEvent(overrides: Partial<TimelineEventData> = {}): TimelineEventData {
  return {
    id: "e1",
    resourceId: "r1",
    start: "2026-01-08",
    end: "2026-01-09",
    label: "Event",
    ...overrides,
  };
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderTimeline(overrides: Partial<Parameters<typeof useTimelineEvents>[0]> = {}) {
  return renderHook(() =>
    useTimelineEvents({
      endpoint: "/lattice/timelines/demo",
      componentRef: "ref-1",
      initialEvents: [],
      initialFrom: "2026-01-08",
      days: 7,
      ...overrides,
    }),
  );
}

describe("useTimelineEvents", () => {
  it("does not fetch when the requested window is already loaded", () => {
    const { result } = renderTimeline();

    act(() => result.current.ensureRange("2026-01-08", "2026-01-15"));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches only the uncovered gap when the window shifts back", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ events: [] }));
    const { result } = renderTimeline();

    act(() => result.current.ensureRange("2026-01-01", "2026-01-08"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe("/lattice/timelines/demo?from=2026-01-01&to=2026-01-08");
  });

  it("merges fetched events into the existing map by id", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        events: [fakeEvent({ id: "e1", label: "Updated" }), fakeEvent({ id: "e2", label: "New" })],
      }),
    );
    const { result } = renderTimeline({ initialEvents: [fakeEvent({ id: "e1", label: "Old" })] });

    act(() => result.current.ensureRange("2026-01-15", "2026-01-22"));

    await waitFor(() => expect(result.current.events.get("e2")).toBeDefined());

    expect(result.current.events.get("e1")?.label).toBe("Updated");
    expect(result.current.events.get("e2")?.label).toBe("New");
    expect(result.current.events.size).toBe(2);
  });

  it("dedupes a repeated request for the same in-flight gap", () => {
    fetchMock.mockResolvedValue(jsonResponse({ events: [] }));
    const { result } = renderTimeline();

    act(() => {
      result.current.ensureRange("2026-01-01", "2026-01-08");
      result.current.ensureRange("2026-01-01", "2026-01-08");
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("is a no-op without an endpoint or ref", () => {
    const { result } = renderTimeline({ endpoint: null, componentRef: null });

    act(() => result.current.ensureRange("2026-02-01", "2026-02-08"));

    expect(fetchMock).not.toHaveBeenCalled();
  });
});

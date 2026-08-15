import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@lattice-php/core/test-support";
import { useCalendarEvents } from "./calendar-state";
import { calendarEvent } from "./test-support";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderState(overrides: Partial<Parameters<typeof useCalendarEvents>[0]> = {}) {
  return renderHook(() =>
    useCalendarEvents({
      endpoint: "/lattice/calendars/demo",
      componentRef: "ref-1",
      initialEvents: [],
      initialFrom: "2026-01-08",
      initialTo: "2026-01-15",
      ...overrides,
    }),
  );
}

describe("useCalendarEvents", () => {
  it("does not fetch when the requested window is already loaded", () => {
    const { result } = renderState();

    act(() => result.current.ensureRange("2026-01-08", "2026-01-15"));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches only the uncovered gap when the window shifts back", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ events: [] }));
    const { result } = renderState();

    act(() => result.current.ensureRange("2026-01-01", "2026-01-08"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe("/lattice/calendars/demo?from=2026-01-01&to=2026-01-08");
  });

  it("merges fetched events into the existing map by id", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        events: [
          calendarEvent({ id: "e1", label: "Updated" }),
          calendarEvent({ id: "e2", label: "New" }),
        ],
      }),
    );
    const { result } = renderState({ initialEvents: [calendarEvent({ id: "e1", label: "Old" })] });

    act(() => result.current.ensureRange("2026-01-15", "2026-01-22"));

    await waitFor(() => expect(result.current.events.get("e2")).toBeDefined());

    expect(result.current.events.get("e1")?.label).toBe("Updated");
    expect(result.current.events.get("e2")?.label).toBe("New");
    expect(result.current.events.size).toBe(2);
  });

  it("dedupes a repeated request for the same in-flight gap", () => {
    fetchMock.mockResolvedValue(jsonResponse({ events: [] }));
    const { result } = renderState();

    act(() => {
      result.current.ensureRange("2026-01-01", "2026-01-08");
      result.current.ensureRange("2026-01-01", "2026-01-08");
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("is a no-op without an endpoint or ref", () => {
    const { result } = renderState({ endpoint: null, componentRef: null });

    act(() => result.current.ensureRange("2026-02-01", "2026-02-08"));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rolls an optimistic reschedule back when the event payload is rejected", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ errors: { resourceId: ["Unavailable."] } }, { status: 422 }),
    );
    const initial = calendarEvent({ id: "e1", resourceId: "r1" });
    const { result } = renderState({ initialEvents: [initial] });

    let outcome: { accepted: boolean; message: string | null } | undefined;
    await act(async () => {
      outcome = await result.current.reschedule({
        id: "e1",
        resourceId: "r2",
        start: "2026-08-11",
        end: "2026-08-12",
      });
    });

    expect(outcome).toEqual({ accepted: false, message: "Unavailable." });
    expect(result.current.events.get("e1")).toEqual(initial);
  });
});

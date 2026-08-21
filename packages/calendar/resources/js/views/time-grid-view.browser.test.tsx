import { page, userEvent } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { jsonResponse } from "@lattice-php/core/test-support";
import CalendarComponent from "../calendar";
import { calendarEvent, calendarNode, testRegistry } from "../test-support";
import type { CalendarWireProps } from "../types";

// The stylesheet sizes an hour at 3rem (48px), so one minute is 0.8px.
const PX_PER_MINUTE = 0.8;

const anchor = "2026-08-12";

function standup() {
  return calendarEvent({
    id: "standup",
    start: "2026-08-10T09:30:00",
    end: "2026-08-10T10:30:00",
    allDay: false,
    label: "Standup",
  });
}

async function renderWeek(props: Partial<CalendarWireProps> = {}) {
  const node = calendarNode({ date: anchor, views: ["week"], defaultView: "week", ...props });

  return renderWithRegistry(
    <CalendarComponent node={node}>{null}</CalendarComponent>,
    testRegistry,
  );
}

describe("calendar week view in a browser", () => {
  it("scrolls the time grid to the working-day start on mount", async () => {
    await renderWeek({ events: [standup()] });

    const scroller = document.querySelector(".lt-calendar-timegrid-scroll");

    await expect
      .poll(() => (scroller instanceof HTMLElement ? scroller.scrollTop : 0))
      .toBeCloseTo(7 * 60 * PX_PER_MINUTE, 0);
  });

  it("moves an event to another day and time by dragging its block, snapping to the grid", async () => {
    const event = standup();
    const updated = { ...event, start: "2026-08-12T13:00:00", end: "2026-08-12T14:00:00" };
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ event: updated }));
    vi.stubGlobal("fetch", fetchMock);
    await renderWeek({ reschedulable: true, events: [event] });

    await userEvent.dragAndDrop(
      page.getByTestId("calendar-event-standup"),
      page.getByTestId("calendar-timegrid-col-2026-08-12"),
      {
        sourcePosition: { x: 5, y: 1 },
        targetPosition: { x: 5, y: 13 * 60 * PX_PER_MINUTE },
      },
    );

    await expect
      .element(page.getByTestId("calendar-event-standup"))
      .toHaveAttribute("data-start", "2026-08-12T13:00:00");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/lattice/calendars/demo");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(String(init.body))).toEqual({
      id: "standup",
      resourceId: null,
      start: "2026-08-12T13:00:00",
      end: "2026-08-12T14:00:00",
    });
  });

  it("extends an event by dragging its resize handle to a later time", async () => {
    const event = standup();
    const updated = { ...event, end: "2026-08-10T12:00:00" };
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ event: updated }));
    vi.stubGlobal("fetch", fetchMock);
    await renderWeek({ reschedulable: true, events: [event] });

    await userEvent.dragAndDrop(
      page.getByTestId("calendar-resize-end-standup"),
      page.getByTestId("calendar-timegrid-col-2026-08-10"),
      { targetPosition: { x: 5, y: 12 * 60 * PX_PER_MINUTE } },
    );

    await expect
      .element(page.getByTestId("calendar-event-standup"))
      .toHaveAttribute("data-end", "2026-08-10T12:00:00");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      id: "standup",
      resourceId: null,
      start: "2026-08-10T09:30:00",
      end: "2026-08-10T12:00:00",
    });
  });

  it("moves an all-day event by dragging its chip onto another all-day cell", async () => {
    const event = calendarEvent({
      id: "fair",
      start: "2026-08-10",
      end: "2026-08-12",
      label: "Fair",
    });
    const updated = { ...event, start: "2026-08-13", end: "2026-08-15" };
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ event: updated }));
    vi.stubGlobal("fetch", fetchMock);
    await renderWeek({ reschedulable: true, events: [event] });

    await userEvent.dragAndDrop(
      page.getByTestId("calendar-event-fair"),
      page.getByTestId("calendar-allday-2026-08-13"),
      { sourcePosition: { x: 5, y: 5 } },
    );

    await expect
      .element(page.getByTestId("calendar-event-fair"))
      .toHaveAttribute("data-start", "2026-08-13");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      id: "fair",
      resourceId: null,
      start: "2026-08-13",
      end: "2026-08-15",
    });
  });

  it("extends an all-day event by dragging its end handle onto a later day", async () => {
    const event = calendarEvent({
      id: "fair",
      start: "2026-08-10",
      end: "2026-08-12",
      label: "Fair",
    });
    const updated = { ...event, end: "2026-08-15" };
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ event: updated }));
    vi.stubGlobal("fetch", fetchMock);
    await renderWeek({ reschedulable: true, events: [event] });

    await userEvent.dragAndDrop(
      page.getByTestId("calendar-allday-resize-end-fair"),
      page.getByTestId("calendar-allday-2026-08-14"),
    );

    await expect
      .element(page.getByTestId("calendar-event-fair"))
      .toHaveAttribute("data-end", "2026-08-15");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      id: "fair",
      resourceId: null,
      start: "2026-08-10",
      end: "2026-08-15",
    });
  });

  it("rolls a rejected drop back and raises the rejection as a danger toast", async () => {
    const event = standup();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        jsonResponse({ errors: { start: ["This event cannot move there."] } }, { status: 422 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const toastListener = vi.fn<(toastEvent: Event) => void>();
    window.addEventListener("lattice:toast", toastListener);
    await renderWeek({ reschedulable: true, events: [event] });

    await userEvent.dragAndDrop(
      page.getByTestId("calendar-event-standup"),
      page.getByTestId("calendar-timegrid-col-2026-08-12"),
      {
        sourcePosition: { x: 5, y: 1 },
        targetPosition: { x: 5, y: 13 * 60 * PX_PER_MINUTE },
      },
    );

    await expect
      .element(page.getByTestId("calendar-event-standup"))
      .toHaveAttribute("data-start", "2026-08-10T09:30:00");
    await expect.poll(() => toastListener.mock.calls.length).toBe(1);
    expect((toastListener.mock.calls[0]?.[0] as CustomEvent).detail).toMatchObject({
      message: "This event cannot move there.",
      variant: "danger",
    });

    window.removeEventListener("lattice:toast", toastListener);
  });
});

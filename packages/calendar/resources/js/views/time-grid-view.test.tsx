import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@lattice-php/core/test-support";
import { addDays, startOfWeekISO } from "@lattice-php/ui/format/temporal";
import { calendarEvent, dayAction, renderCalendar } from "../test-support";

const anchor = "2026-08-15";
const weekStart = startOfWeekISO(anchor, "en");

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(() => Promise.resolve(jsonResponse({ events: [] })));
  vi.stubGlobal("fetch", fetchMock);
});

function timedEvent(overrides: Parameters<typeof calendarEvent>[0] = {}) {
  return calendarEvent({
    id: "standup",
    start: `${weekStart}T09:30:00`,
    end: `${weekStart}T10:30:00`,
    allDay: false,
    label: "Standup",
    ...overrides,
  });
}

function renderWeek(props: Parameters<typeof renderCalendar>[0] = {}) {
  return renderCalendar({ date: anchor, views: ["week"], defaultView: "week", ...props });
}

describe("TimeGridView week", () => {
  it("renders a timed event as a block inside its day column", () => {
    renderWeek({ events: [timedEvent()] });

    const column = screen.getByTestId(`calendar-timegrid-col-${weekStart}`);
    const block = screen.getByTestId("calendar-event-standup");

    expect(column).toContainElement(block);
    expect(block).toHaveTextContent(/9:30/);
    expect(block).toHaveTextContent("Standup");
  });

  it("routes all-day and midnight-crossing events to the all-day row", () => {
    renderWeek({
      events: [
        calendarEvent({ id: "fair", start: weekStart, end: addDays(weekStart, 2), label: "Fair" }),
        timedEvent({
          id: "overnight",
          start: `${weekStart}T22:00:00`,
          end: `${addDays(weekStart, 1)}T02:00:00`,
          label: "Overnight",
        }),
      ],
    });

    const columns = screen.getAllByTestId(/calendar-timegrid-col-/);

    for (const column of columns) {
      expect(column).not.toContainElement(screen.getByTestId("calendar-event-fair"));
      expect(column).not.toContainElement(screen.getByTestId("calendar-event-overnight"));
    }
  });

  it("navigates weeks, fetching only the uncovered range", async () => {
    renderWeek();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe(
      `/lattice/calendars/demo?from=${addDays(anchor, 7)}&to=${addDays(weekStart, 21)}`,
    );
  });

  it("moves a timed event by fifteen minutes with Ctrl+Shift+ArrowDown", async () => {
    const event = timedEvent();
    fetchMock.mockResolvedValue(
      jsonResponse({
        event: { ...event, start: `${weekStart}T09:45:00`, end: `${weekStart}T10:45:00` },
      }),
    );
    renderWeek({ reschedulable: true, events: [event] });

    fireEvent.keyDown(screen.getByTestId("calendar-event-standup"), {
      ctrlKey: true,
      key: "ArrowDown",
      shiftKey: true,
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/lattice/calendars/demo");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(String(init.body))).toEqual({
      id: "standup",
      resourceId: null,
      start: `${weekStart}T09:45:00`,
      end: `${weekStart}T10:45:00`,
    });
  });

  it("moves a timed event by a day with Ctrl+Shift+ArrowRight, keeping its wall-clock times", async () => {
    const event = timedEvent();
    const nextDay = addDays(weekStart, 1);
    fetchMock.mockResolvedValue(
      jsonResponse({
        event: { ...event, start: `${nextDay}T09:30:00`, end: `${nextDay}T10:30:00` },
      }),
    );
    renderWeek({ reschedulable: true, events: [event] });

    fireEvent.keyDown(screen.getByTestId("calendar-event-standup"), {
      ctrlKey: true,
      key: "ArrowRight",
      shiftKey: true,
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      id: "standup",
      resourceId: null,
      start: `${nextDay}T09:30:00`,
      end: `${nextDay}T10:30:00`,
    });
  });

  it("extends the event end by fifteen minutes with ArrowDown on the resize handle", async () => {
    const event = timedEvent();
    fetchMock.mockResolvedValue(
      jsonResponse({ event: { ...event, end: `${weekStart}T10:45:00` } }),
    );
    renderWeek({ reschedulable: true, events: [event] });

    const handle = screen.getByTestId("calendar-resize-end-standup");
    handle.focus();
    fireEvent.keyDown(handle, { key: "ArrowDown" });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      id: "standup",
      resourceId: null,
      start: `${weekStart}T09:30:00`,
      end: `${weekStart}T10:45:00`,
    });
    expect(screen.getByTestId("calendar-resize-end-standup")).toHaveFocus();
  });

  it("refuses to shrink an event below the snap step via the resize handle", () => {
    renderWeek({
      reschedulable: true,
      events: [timedEvent({ end: `${weekStart}T09:45:00` })],
    });

    fireEvent.keyDown(screen.getByTestId("calendar-resize-end-standup"), { key: "ArrowUp" });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shifts an all-day chip by a day with Ctrl+Shift+ArrowRight", async () => {
    const event = calendarEvent({
      id: "fair",
      start: weekStart,
      end: addDays(weekStart, 2),
      label: "Fair",
    });
    fetchMock.mockResolvedValue(
      jsonResponse({
        event: { ...event, start: addDays(weekStart, 1), end: addDays(weekStart, 3) },
      }),
    );
    renderWeek({ reschedulable: true, events: [event] });

    fireEvent.keyDown(screen.getByTestId("calendar-event-fair"), {
      ctrlKey: true,
      key: "ArrowRight",
      shiftKey: true,
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      id: "fair",
      resourceId: null,
      start: addDays(weekStart, 1),
      end: addDays(weekStart, 3),
    });
  });

  it("offers no reschedule affordance when the calendar is not reschedulable", () => {
    renderWeek({ events: [timedEvent()] });

    const block = screen.getByTestId("calendar-event-standup");
    expect(block.tagName).toBe("DIV");
    expect(screen.queryByTestId("calendar-resize-end-standup")).not.toBeInTheDocument();

    fireEvent.keyDown(block, { ctrlKey: true, key: "ArrowDown", shiftKey: true });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts the day action payload when a day column is clicked, but not for a block click", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ effects: [] }));
    renderWeek({ dayAction, eventAction: null, events: [timedEvent()] });

    fireEvent.click(screen.getByTestId("calendar-event-standup"));

    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId(`calendar-timegrid-col-${addDays(weekStart, 1)}`));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/lattice/actions/plan-day");
    expect(JSON.parse(String(init.body))).toEqual({ date: addDays(weekStart, 1) });
  });

  it("switches from month to week reusing already-loaded events without a refetch", () => {
    renderCalendar({
      date: anchor,
      views: ["month", "week"],
      defaultView: "month",
      events: [timedEvent()],
    });

    fireEvent.click(screen.getByRole("radio", { name: "Week" }));

    expect(screen.getByTestId(`calendar-timegrid-col-${weekStart}`)).toContainElement(
      screen.getByTestId("calendar-event-standup"),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("TimeGridView day", () => {
  it("renders a single day column and navigates by one day", async () => {
    renderCalendar({
      date: anchor,
      views: ["day"],
      defaultView: "day",
      events: [timedEvent({ start: `${anchor}T09:30:00`, end: `${anchor}T10:30:00` })],
    });

    expect(screen.getAllByTestId(/calendar-timegrid-col-/)).toHaveLength(1);
    expect(screen.getByTestId(`calendar-timegrid-col-${anchor}`)).toContainElement(
      screen.getByTestId("calendar-event-standup"),
    );

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByTestId(`calendar-timegrid-col-${addDays(anchor, 1)}`)).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe(`/lattice/calendars/demo?from=${addDays(anchor, 1)}&to=${addDays(anchor, 3)}`);
  });
});

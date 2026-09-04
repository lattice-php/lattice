import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@lattice-php/core/test-support";
import { currentTimezone } from "@lattice-php/ui/i18n";
import { addDays, addMonths, startOfMonthISO, todayISO } from "@lattice-php/ui/format/temporal";
import { monthGridRange } from "./month-grid";
import { calendarEvent, dayAction, eventAction, renderCalendar } from "./test-support";

const today = todayISO(currentTimezone());
const monthStart = startOfMonthISO(today);

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(() => Promise.resolve(jsonResponse({ events: [] })));
  vi.stubGlobal("fetch", fetchMock);
});

function monthTitle(monthISO: string): string {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(
    new Date(`${monthISO}T12:00:00Z`),
  );
}

describe("CalendarComponent month view", () => {
  it("renders initial events as inert chips when no event action is wired", () => {
    renderCalendar({
      date: today,
      events: [calendarEvent({ id: "e1", start: today, end: addDays(today, 1), label: "Kickoff" })],
    });

    const chip = screen.getByTestId("calendar-event-e1");
    expect(chip).toHaveTextContent("Kickoff");
    expect(chip.tagName).toBe("DIV");
    expect(screen.queryByRole("button", { name: /Kickoff/ })).not.toBeInTheDocument();
  });

  it("prefixes timed chips with their wall-clock start", () => {
    renderCalendar({
      date: today,
      events: [
        calendarEvent({
          id: "timed",
          start: `${today}T09:30:00`,
          end: `${today}T10:30:00`,
          allDay: false,
          label: "Standup",
        }),
      ],
    });

    expect(screen.getByTestId("calendar-event-timed")).toHaveTextContent("9:30");
  });

  it("navigates months, fetching only the range the initial window does not cover", async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(
        jsonResponse({
          events: [
            calendarEvent({
              id: "next-month",
              start: addDays(addMonths(monthStart, 1), 10),
              end: addDays(addMonths(monthStart, 1), 11),
              label: "Planning offsite",
            }),
          ],
        }),
      ),
    );
    renderCalendar({ date: today });

    expect(screen.getByText(monthTitle(monthStart))).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText(monthTitle(addMonths(monthStart, 1)))).toBeInTheDocument();
    await screen.findByTestId("calendar-event-next-month");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0] as [string];
    const expectedFrom = addDays(addMonths(monthStart, 1), 7);
    const [, expectedTo] = monthGridRange(addMonths(monthStart, 2), "en");
    expect(url).toBe(`/lattice/calendars/demo?from=${expectedFrom}&to=${expectedTo}`);

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));

    expect(screen.getByText(monthTitle(monthStart))).toBeInTheDocument();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const [backfillUrl] = fetchMock.mock.calls[1] as [string];
    const [prefetchFrom] = monthGridRange(addMonths(monthStart, -1), "en");
    expect(backfillUrl).toBe(
      `/lattice/calendars/demo?from=${prefetchFrom}&to=${addDays(monthStart, -7)}`,
    );
  });

  it("returns to the current month via Today and refetches nothing once its ranges are loaded", async () => {
    renderCalendar({ date: today });

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "Today" }));

    expect(screen.getByText(monthTitle(monthStart))).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByRole("button", { name: "Today" }));

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("posts the day action payload when a day cell is clicked", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ effects: [] }));
    renderCalendar({ date: today, dayAction });

    fireEvent.click(screen.getByTestId(`calendar-day-${today}`));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/lattice/actions/plan-day");
    expect(JSON.parse(String(init.body))).toEqual({ date: today });
  });

  it("posts the event action payload with the event's context on chip click", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ effects: [] }));
    renderCalendar({
      date: today,
      eventAction,
      events: [
        calendarEvent({
          id: "e1",
          start: today,
          end: addDays(today, 1),
          label: "Kickoff",
          context: { kind: "meeting" },
        }),
      ],
    });

    fireEvent.click(screen.getByTestId("calendar-event-e1"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/lattice/actions/show-event");
    expect(JSON.parse(String(init.body))).toEqual({ eventId: "e1", kind: "meeting" });
  });

  it("moves an all-day event by one day with Ctrl+Shift+Arrow, keeping its duration", async () => {
    const event = calendarEvent({
      id: "e1",
      start: "2026-08-10",
      end: "2026-08-12",
      label: "Offsite",
    });
    fetchMock.mockResolvedValue(
      jsonResponse({ event: { ...event, start: "2026-08-11", end: "2026-08-13" } }),
    );
    renderCalendar({ date: "2026-08-15", reschedulable: true, events: [event] });

    fireEvent.keyDown(screen.getByTestId("calendar-event-e1"), {
      ctrlKey: true,
      key: "ArrowRight",
      shiftKey: true,
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/lattice/calendars/demo");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(String(init.body))).toEqual({
      id: "e1",
      resourceId: null,
      start: "2026-08-11",
      end: "2026-08-13",
    });
  });

  it("moves a timed event by a week with Ctrl+Shift+ArrowDown, preserving its wall-clock times", async () => {
    const event = calendarEvent({
      id: "timed",
      start: "2026-08-10T09:30:00",
      end: "2026-08-10T10:30:00",
      allDay: false,
      label: "Standup",
    });
    fetchMock.mockResolvedValue(
      jsonResponse({
        event: { ...event, start: "2026-08-17T09:30:00", end: "2026-08-17T10:30:00" },
      }),
    );
    renderCalendar({ date: "2026-08-15", reschedulable: true, events: [event] });

    fireEvent.keyDown(screen.getByTestId("calendar-event-timed"), {
      ctrlKey: true,
      key: "ArrowDown",
      shiftKey: true,
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      id: "timed",
      resourceId: null,
      start: "2026-08-17T09:30:00",
      end: "2026-08-17T10:30:00",
    });
  });

  it("offers no reschedule affordance when the calendar is not reschedulable", () => {
    renderCalendar({
      date: "2026-08-15",
      events: [calendarEvent({ id: "e1", start: "2026-08-10", end: "2026-08-12" })],
    });

    const chip = screen.getByTestId("calendar-event-e1");
    expect(chip).not.toHaveAttribute("aria-keyshortcuts");

    fireEvent.keyDown(chip, { ctrlKey: true, key: "ArrowRight", shiftKey: true });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("hides the view switcher for a single view", () => {
    renderCalendar({ date: today });

    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("switches to the timeline view reusing already-loaded events without a refetch", () => {
    renderCalendar({
      date: today,
      views: ["month", "timeline"],
      defaultView: "month",
      groups: [{ key: "g", label: "Group", resources: [{ id: "r1", label: "Alice" }] }],
      events: [
        calendarEvent({
          id: "assignment",
          resourceId: "r1",
          start: today,
          end: addDays(today, 1),
          label: "Assignment",
        }),
      ],
    });

    fireEvent.click(screen.getByRole("radio", { name: "Timeline" }));

    expect(screen.getByTestId("timeline-entry-assignment")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("radio", { name: "Month" }));

    expect(screen.getByTestId("calendar-event-assignment")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

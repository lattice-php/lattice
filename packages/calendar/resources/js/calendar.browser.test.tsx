import { page, userEvent } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { jsonResponse } from "@lattice-php/core/test-support";
import CalendarComponent from "./calendar";
import { calendarEvent, calendarNode, dayAction, eventAction, testRegistry } from "./test-support";
import type { CalendarWireProps } from "./types";

const august = "2026-08-01";

function overflowDayEvents() {
  return [
    calendarEvent({ id: "a", start: "2026-08-10", end: "2026-08-11", label: "Alpha" }),
    calendarEvent({ id: "b", start: "2026-08-10", end: "2026-08-11", label: "Beta" }),
    calendarEvent({ id: "c", start: "2026-08-10", end: "2026-08-11", label: "Gamma" }),
    calendarEvent({
      id: "d",
      start: "2026-08-10T15:00:00",
      end: "2026-08-10T16:00:00",
      allDay: false,
      label: "Delta",
    }),
    calendarEvent({
      id: "e",
      start: "2026-08-10T16:30:00",
      end: "2026-08-10T17:00:00",
      allDay: false,
      label: "Epsilon",
    }),
  ];
}

async function renderMonth(props: Partial<CalendarWireProps> = {}) {
  const node = calendarNode({ date: august, ...props });

  return renderWithRegistry(
    <CalendarComponent node={node}>{null}</CalendarComponent>,
    testRegistry,
  );
}

describe("calendar month view in a browser", () => {
  it("reveals hidden events for a day through the overflow popover and runs the event action", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ effects: [] }));
    vi.stubGlobal("fetch", fetchMock);
    await renderMonth({ events: overflowDayEvents(), eventAction });

    const trigger = page.getByTestId("calendar-more-2026-08-10");
    await expect.element(trigger).toMatchTextContent("+2 more");

    await userEvent.click(trigger);

    const list = page.getByTestId("calendar-more-list-2026-08-10");
    await expect.element(list).toBeVisible();
    await expect.element(list.getByText("Alpha")).toBeVisible();
    await expect.element(list.getByText("Epsilon")).toBeVisible();

    await userEvent.click(list.getByRole("button", { name: /Epsilon/ }));

    await expect.poll(() => fetchMock.mock.calls.length).toBe(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/lattice/actions/show-event");
    expect(JSON.parse(String(init.body))).toEqual({ eventId: "e" });
  });

  it("roves day focus with the keyboard across week and month boundaries", async () => {
    await renderMonth();

    await userEvent.click(page.getByTestId("calendar-day-2026-08-12"));
    await userEvent.keyboard("{ArrowRight}");

    await expect.poll(() => document.activeElement?.getAttribute("data-date")).toBe("2026-08-13");

    await userEvent.keyboard("{ArrowDown}");

    await expect.poll(() => document.activeElement?.getAttribute("data-date")).toBe("2026-08-20");

    await userEvent.keyboard("{PageDown}");

    await expect.poll(() => document.activeElement?.getAttribute("data-date")).toBe("2026-09-20");
    await expect.element(page.getByText("September 2026")).toBeVisible();

    await userEvent.keyboard("{PageUp}");

    await expect.poll(() => document.activeElement?.getAttribute("data-date")).toBe("2026-08-20");
    await expect.element(page.getByText("August 2026")).toBeVisible();
  });

  it("fires the day action from the keyboard on the focused cell", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ effects: [] }));
    vi.stubGlobal("fetch", fetchMock);
    await renderMonth({ dayAction });

    await userEvent.click(page.getByTestId("calendar-day-2026-08-12"));
    await expect.poll(() => fetchMock.mock.calls.length).toBe(1);

    await userEvent.keyboard("{ArrowRight}{Enter}");

    await expect.poll(() => fetchMock.mock.calls.length).toBe(2);
    const [url, init] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(url).toBe("/lattice/actions/plan-day");
    expect(JSON.parse(String(init.body))).toEqual({ date: "2026-08-13" });
  });

  it("moves an event to another day by dragging its chip onto the day cell", async () => {
    const event = calendarEvent({
      id: "e1",
      start: "2026-08-10",
      end: "2026-08-11",
      label: "Kickoff",
    });
    const updated = { ...event, start: "2026-08-12", end: "2026-08-13" };
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ event: updated }));
    vi.stubGlobal("fetch", fetchMock);
    await renderMonth({ reschedulable: true, events: [event] });

    await userEvent.dragAndDrop(
      page.getByTestId("calendar-event-e1"),
      page.getByTestId("calendar-day-2026-08-12"),
    );

    await expect
      .element(page.getByTestId("calendar-event-e1"))
      .toHaveAttribute("data-start", "2026-08-12");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/lattice/calendars/demo");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(String(init.body))).toEqual({
      id: "e1",
      resourceId: null,
      start: "2026-08-12",
      end: "2026-08-13",
    });
  });

  it("moves the whole multi-week event when dragging a later weekly segment", async () => {
    const event = calendarEvent({
      id: "multi",
      start: "2026-08-05",
      end: "2026-08-15",
      label: "Campaign",
    });
    const updated = { ...event, start: "2026-08-16", end: "2026-08-26" };
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ event: updated }));
    vi.stubGlobal("fetch", fetchMock);
    await renderMonth({ reschedulable: true, events: [event] });

    // Grab the second week's segment on its first day (Sunday 2026-08-09, four
    // days into the event) and drop on 2026-08-20: the grab offset must keep
    // the grabbed day under the cursor, shifting the start to 2026-08-16.
    await userEvent.dragAndDrop(
      page.getByTestId("calendar-event-multi").nth(1),
      page.getByTestId("calendar-day-2026-08-20"),
      { sourcePosition: { x: 5, y: 8 } },
    );

    await expect.poll(() => fetchMock.mock.calls.length).toBe(1);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      id: "multi",
      resourceId: null,
      start: "2026-08-16",
      end: "2026-08-26",
    });
  });

  it("rolls a rejected drag back and raises the translated rejection as a danger toast", async () => {
    const event = calendarEvent({
      id: "e1",
      start: "2026-08-10",
      end: "2026-08-11",
      label: "Kickoff",
    });
    let rejectRequest: ((response: Response) => void) | undefined;
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          rejectRequest = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const toastListener = vi.fn<(toastEvent: Event) => void>();
    window.addEventListener("lattice:toast", toastListener);
    await renderMonth({ reschedulable: true, events: [event] });

    await userEvent.dragAndDrop(
      page.getByTestId("calendar-event-e1"),
      page.getByTestId("calendar-day-2026-08-12"),
    );

    await expect
      .element(page.getByTestId("calendar-event-e1"))
      .toHaveAttribute("data-start", "2026-08-12");

    rejectRequest?.(
      jsonResponse({ errors: { start: ["This event cannot move there."] } }, { status: 422 }),
    );

    await expect
      .element(page.getByTestId("calendar-event-e1"))
      .toHaveAttribute("data-start", "2026-08-10");
    await expect.poll(() => toastListener.mock.calls.length).toBe(1);
    expect((toastListener.mock.calls[0]?.[0] as CustomEvent).detail).toMatchObject({
      message: "This event cannot move there.",
      variant: "danger",
    });

    window.removeEventListener("lattice:toast", toastListener);
  });

  it("switches between month and timeline views keeping the loaded events", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    await renderMonth({
      views: ["month", "timeline"],
      defaultView: "month",
      groups: [{ key: "g", label: "Group", resources: [{ id: "r1", label: "Alice" }] }],
      events: [
        calendarEvent({
          id: "assignment",
          resourceId: "r1",
          start: "2026-08-03",
          end: "2026-08-05",
          label: "Assignment",
        }),
      ],
      reschedulable: true,
    });

    await expect.element(page.getByTestId("calendar-event-assignment")).toBeVisible();

    await userEvent.click(page.getByRole("radio", { name: "Timeline" }));

    await expect.element(page.getByTestId("timeline-entry-assignment")).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

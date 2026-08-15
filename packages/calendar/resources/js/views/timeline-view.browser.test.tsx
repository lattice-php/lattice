import { page, userEvent } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { jsonResponse } from "@lattice-php/core/test-support";
import CalendarComponent from "../calendar";
import { calendarEvent, calendarNode, testRegistry } from "../test-support";
import type { CalendarEventData, CalendarWireProps } from "../types";

const initialEvent: CalendarEventData = calendarEvent({
  id: "assignment-1",
  resourceId: "anna",
  start: "2026-01-02",
  end: "2026-01-04",
  label: "Website Relaunch",
});

async function renderTimeline(props: Partial<CalendarWireProps> = {}) {
  const node = calendarNode({
    views: ["timeline"],
    defaultView: "timeline",
    date: "2026-01-01",
    days: 7,
    groups: [
      {
        key: "resources",
        label: "Resources",
        resources: [
          { id: "team-website", label: "Website Team" },
          { id: "anna", label: "Anna" },
        ],
      },
    ],
    events: [initialEvent],
    reschedulable: true,
    ...props,
  });

  return renderWithRegistry(
    <CalendarComponent node={node}>{null}</CalendarComponent>,
    testRegistry,
  );
}

function entry() {
  return page.getByTestId("timeline-entry-assignment-1");
}

function resource(id: string) {
  return page.getByTestId(`timeline-resource-${id}`);
}

function resizeHandle(edge: "start" | "end") {
  return page.getByTestId(`timeline-resize-${edge}-assignment-1`);
}

async function dragToTeam(): Promise<void> {
  const target = resource("team-website");
  const rect = target.element().getBoundingClientRect();

  await userEvent.dragAndDrop(entry(), target, {
    targetPosition: { x: 84, y: Math.round(rect.height / 2) },
  });
}

describe("timeline rescheduling in a browser", () => {
  it("moves an assignment across resource and time in one request", async () => {
    const updated = {
      ...initialEvent,
      resourceId: "team-website",
      start: "2026-01-04",
      end: "2026-01-06",
    };
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ event: updated }));
    vi.stubGlobal("fetch", fetchMock);
    await renderTimeline();

    await dragToTeam();

    await expect.element(entry()).toHaveAttribute("data-resource-id", "team-website");
    await expect.element(entry()).toHaveAttribute("data-start", "2026-01-04");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      id: "assignment-1",
      resourceId: "team-website",
      start: "2026-01-04",
      end: "2026-01-06",
    });
  });

  it("preserves the hidden portion of an entry clipped by the visible window", async () => {
    const clippedEvent = {
      ...initialEvent,
      start: "2025-12-31",
      end: "2026-01-03",
    };
    const updated = { ...clippedEvent, resourceId: "team-website" };
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ event: updated }));
    vi.stubGlobal("fetch", fetchMock);
    await renderTimeline({ events: [clippedEvent] });

    const target = resource("team-website");
    const rect = target.element().getBoundingClientRect();
    await userEvent.dragAndDrop(entry(), target, {
      targetPosition: { x: 36, y: Math.round(rect.height / 2) },
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toMatchObject({
      resourceId: "team-website",
      start: "2025-12-31",
      end: "2026-01-03",
    });
  });

  it("rolls an optimistic move back and raises the translated rejection as a danger toast", async () => {
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
    await renderTimeline();

    await dragToTeam();

    await expect.element(entry()).toHaveAttribute("data-resource-id", "team-website");

    rejectRequest?.(
      jsonResponse(
        { errors: { resourceId: ["This planning resource is unavailable."] } },
        { status: 422 },
      ),
    );

    await expect.element(entry()).toHaveAttribute("data-resource-id", "anna");
    await expect.poll(() => toastListener.mock.calls.length).toBe(1);
    expect((toastListener.mock.calls[0]?.[0] as CustomEvent).detail).toMatchObject({
      message: "This planning resource is unavailable.",
      variant: "danger",
    });

    window.removeEventListener("lattice:toast", toastListener);
  });

  it("supports moving a focused assignment by keyboard", async () => {
    const updated = {
      ...initialEvent,
      start: "2026-01-03",
      end: "2026-01-05",
    };
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ event: updated }));
    vi.stubGlobal("fetch", fetchMock);
    await renderTimeline();

    await userEvent.click(entry());
    await userEvent.keyboard("{Control>}{Shift>}{ArrowRight}{/Shift}{/Control}");

    await expect.element(entry()).toHaveAttribute("data-start", "2026-01-03");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toMatchObject({
      id: "assignment-1",
      resourceId: "anna",
      start: "2026-01-03",
      end: "2026-01-05",
    });
  });

  it("resizes the start on its existing resource without moving the end", async () => {
    const updated = { ...initialEvent, start: "2026-01-03" };
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ event: updated }));
    vi.stubGlobal("fetch", fetchMock);
    await renderTimeline();

    await userEvent.dragAndDrop(resizeHandle("start"), resource("anna"), {
      targetPosition: { x: 48, y: 16 },
    });

    await expect.element(entry()).toHaveAttribute("data-start", "2026-01-03");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      id: "assignment-1",
      resourceId: "anna",
      start: "2026-01-03",
      end: "2026-01-04",
    });
  });

  it("keeps one grid interval when resizing the end past the start", async () => {
    const updated = { ...initialEvent, end: "2026-01-03" };
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ event: updated }));
    vi.stubGlobal("fetch", fetchMock);
    await renderTimeline();

    await userEvent.dragAndDrop(resizeHandle("end"), resource("anna"), {
      targetPosition: { x: 1, y: 16 },
    });

    await expect.element(entry()).toHaveAttribute("data-end", "2026-01-03");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      id: "assignment-1",
      resourceId: "anna",
      start: "2026-01-02",
      end: "2026-01-03",
    });
  });

  it("does not turn a resize-handle drag onto another row into an assignment move", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    await renderTimeline();

    await userEvent.dragAndDrop(resizeHandle("end"), resource("team-website"), {
      targetPosition: { x: 96, y: 16 },
    });

    expect(fetchMock).not.toHaveBeenCalled();
    await expect.element(entry()).toHaveAttribute("data-resource-id", "anna");
  });

  it("preserves an off-screen start while resizing the visible end", async () => {
    const clippedEvent = { ...initialEvent, start: "2025-12-31", end: "2026-01-03" };
    const updated = { ...clippedEvent, end: "2026-01-04" };
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ event: updated }));
    vi.stubGlobal("fetch", fetchMock);
    await renderTimeline({ events: [clippedEvent] });

    await userEvent.dragAndDrop(resizeHandle("end"), resource("anna"), {
      targetPosition: { x: 72, y: 16 },
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toMatchObject({
      resourceId: "anna",
      start: "2025-12-31",
      end: "2026-01-04",
    });
  });

  it("uses canvas coordinates when resizing after horizontal scrolling", async () => {
    const scrolledEvent = {
      ...initialEvent,
      start: "2026-02-05",
      end: "2026-02-07",
    };
    const updated = { ...scrolledEvent, end: "2026-02-08" };
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ event: updated }));
    vi.stubGlobal("fetch", fetchMock);
    const { container } = await renderTimeline({ days: 60, events: [scrolledEvent] });
    const scroller = container.querySelector(".lt-timeline-scroll") as HTMLElement;
    scroller.scrollLeft = 720;

    await expect.poll(() => scroller.scrollLeft).toBeGreaterThan(0);
    await userEvent.dragAndDrop(resizeHandle("end"), resource("anna"), {
      targetPosition: { x: 912, y: 16 },
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toMatchObject({
      resourceId: "anna",
      start: "2026-02-05",
      end: "2026-02-08",
    });
  });

  it("rolls a rejected resize back and raises the translated rejection as a danger toast", async () => {
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
    await renderTimeline();

    await userEvent.dragAndDrop(resizeHandle("end"), resource("anna"), {
      targetPosition: { x: 96, y: 16 },
    });

    await expect.element(entry()).toHaveAttribute("data-end", "2026-01-05");

    rejectRequest?.(
      jsonResponse({ errors: { end: ["This assignment cannot end then."] } }, { status: 422 }),
    );

    await expect.element(entry()).toHaveAttribute("data-end", "2026-01-04");
    await expect.poll(() => toastListener.mock.calls.length).toBe(1);
    expect((toastListener.mock.calls[0]?.[0] as CustomEvent).detail).toMatchObject({
      message: "This assignment cannot end then.",
      variant: "danger",
    });

    window.removeEventListener("lattice:toast", toastListener);
  });
});

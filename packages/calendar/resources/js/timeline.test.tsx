import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeNode, jsonResponse } from "@lattice-php/core/test-support";
import { currentTimezone } from "@lattice-php/ui/i18n";
import { addDays, todayISO } from "@lattice-php/ui/format/plain-date";
import TimelineComponent from "./timeline";
import type { TimelineEventData, TimelineGroupData, TimelineWireProps } from "./types";

const today = todayISO(currentTimezone());
const initialFrom = addDays(today, -7);

function makeGroup(overrides: Partial<TimelineGroupData> = {}): TimelineGroupData {
  return {
    key: "team-a",
    label: "Team A",
    resources: [
      { id: "r1", label: "Alice" },
      { id: "r2", label: "Bob" },
    ],
    ...overrides,
  };
}

function makeEvent(overrides: Partial<TimelineEventData> = {}): TimelineEventData {
  return {
    id: "e1",
    resourceId: "r1",
    start: initialFrom,
    end: addDays(initialFrom, 2),
    label: "Design review",
    ...overrides,
  };
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(jsonResponse({ events: [] }));
  vi.stubGlobal("fetch", fetchMock);
});

function renderTimeline(props: Partial<TimelineWireProps> = {}) {
  const node = fakeNode({
    type: "timeline",
    props: {
      groups: [makeGroup()],
      events: [makeEvent()],
      from: initialFrom,
      days: 7,
      ref: "ref-1",
      endpoint: "/lattice/timelines/demo",
      ...props,
    },
  });

  return render(<TimelineComponent node={node}>{null}</TimelineComponent>);
}

function dayOfMonthCells(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll(".lt-timeline-day")).map(
    (cell) => cell.querySelectorAll("span")[1]?.textContent ?? "",
  );
}

describe("TimelineComponent", () => {
  it("hides a group's resource rows when collapsed and restores them on expand", () => {
    renderTimeline();

    expect(screen.getByTitle("Design review")).toBeInTheDocument();
    const collapseButton = screen.getByRole("button", { name: "Collapse Team A" });
    expect(collapseButton).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(collapseButton);

    expect(screen.queryByTitle("Design review")).not.toBeInTheDocument();
    const expandButton = screen.getByRole("button", { name: "Expand Team A" });
    expect(expandButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(expandButton);

    expect(screen.getByTitle("Design review")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Collapse Team A" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("zooms the grid's day width and clamps zoom-out at 10px, re-enabling once zoomed back in", () => {
    const { container } = renderTimeline();
    const grid = container.querySelector(".lt-timeline-grid") as HTMLElement;
    const zoomOut = screen.getByRole("button", { name: "Zoom out" });
    const zoomIn = screen.getByRole("button", { name: "Zoom in" });

    expect(grid.style.getPropertyValue("--lt-timeline-day-width")).toBe("24px");
    expect(zoomOut).not.toBeDisabled();

    fireEvent.click(zoomIn);
    expect(grid.style.getPropertyValue("--lt-timeline-day-width")).toBe("30px");

    fireEvent.click(zoomOut);
    fireEvent.click(zoomOut);
    fireEvent.click(zoomOut);
    fireEvent.click(zoomOut);
    fireEvent.click(zoomOut);

    expect(grid.style.getPropertyValue("--lt-timeline-day-width")).toBe("10px");
    expect(zoomOut).toBeDisabled();

    fireEvent.click(zoomIn);

    expect(grid.style.getPropertyValue("--lt-timeline-day-width")).toBe("12.5px");
    expect(zoomOut).not.toBeDisabled();
  });

  it("navigating next re-labels the day axis, fetches only the uncovered week, and renders the returned event", async () => {
    const fetchedEvent = makeEvent({
      id: "e2",
      resourceId: "r1",
      start: today,
      end: addDays(today, 1),
      label: "Follow-up",
    });
    fetchMock.mockResolvedValue(jsonResponse({ events: [fetchedEvent] }));

    const { container } = renderTimeline();
    const initialDayNumbers = dayOfMonthCells(container);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await screen.findByTitle("Follow-up");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe(`/lattice/timelines/demo?from=${today}&to=${addDays(today, 7)}`);

    const nextDayNumbers = dayOfMonthCells(container);
    expect(nextDayNumbers[0]).toBe(String(Number(today.slice(8, 10))));
    expect(nextDayNumbers[0]).not.toBe(initialDayNumbers[0]);

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));

    expect(dayOfMonthCells(container)).toEqual(initialDayNumbers);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns to the initial window on Today without an extra fetch once it was already loaded", async () => {
    const { container } = renderTimeline();
    const initialDayNumbers = dayOfMonthCells(container);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "Today" }));

    expect(dayOfMonthCells(container)).toEqual(initialDayNumbers);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("stacks overlapping same-resource events into separate lanes and grows the row height", () => {
    const { container } = renderTimeline({
      events: [
        makeEvent({ id: "e1", label: "Kickoff", start: initialFrom, end: addDays(initialFrom, 3) }),
        makeEvent({
          id: "e2",
          label: "Design review",
          start: addDays(initialFrom, 1),
          end: addDays(initialFrom, 4),
        }),
      ],
    });

    expect(screen.getByTitle("Kickoff")).toBeInTheDocument();
    expect(screen.getByTitle("Design review")).toBeInTheDocument();

    const canvas = container.querySelector(".lt-timeline-resource-canvas") as HTMLElement;
    expect(canvas.style.height).toBe("calc(2 * var(--lt-timeline-lane-height))");
  });
});

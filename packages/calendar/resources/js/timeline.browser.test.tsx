import { page, userEvent } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { fakeNode, jsonResponse } from "@lattice-php/core/test-support";
import TimelineComponent from "./timeline";
import type { TimelineEventData, TimelineWireProps } from "./types";

const initialEvent: TimelineEventData = {
  id: "assignment-1",
  resourceId: "anna",
  start: "2026-01-02",
  end: "2026-01-04",
  label: "Website Relaunch",
};

const registry = createRegistry({
  components: { timeline: eagerComponent(TimelineComponent) },
  name: "test/calendar",
});

async function renderTimeline(props: Partial<TimelineWireProps> = {}) {
  const node = fakeNode({
    type: "timeline",
    props: {
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
      from: "2026-01-01",
      days: 7,
      ref: "timeline-ref",
      endpoint: "/lattice/timelines/project-plan",
      ...props,
    },
  });

  return renderWithRegistry(<TimelineComponent node={node}>{null}</TimelineComponent>, registry);
}

function entry() {
  return page.getByTestId("timeline-entry-assignment-1");
}

function resource(id: string) {
  return page.getByTestId(`timeline-resource-${id}`);
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

  it("rolls an optimistic move back and displays the translated rejection", async () => {
    let rejectRequest: ((response: Response) => void) | undefined;
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          rejectRequest = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
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
    await expect
      .element(page.getByRole("alert"))
      .toHaveTextContent("This planning resource is unavailable.");
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
});

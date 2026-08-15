import type { RenderResult } from "@testing-library/react";
import { createRegistry, eagerComponent } from "@lattice-php/core";
import { fakeNode, renderWithRegistry } from "@lattice-php/core/test-support";
import CalendarComponent from "./calendar";
import type { CalendarEventData, CalendarWireProps } from "./types";

export const testRegistry = createRegistry({
  components: { calendar: eagerComponent(CalendarComponent) },
  name: "test/calendar",
});

export function calendarEvent(overrides: Partial<CalendarEventData> = {}): CalendarEventData {
  return {
    id: "e1",
    start: "2026-08-10",
    end: "2026-08-11",
    allDay: true,
    label: "Event",
    resourceId: null,
    color: null,
    context: {},
    ...overrides,
  };
}

export const eventAction = fakeNode({
  props: { endpoint: "/lattice/actions/show-event", method: "post", ref: "event-ref" },
  type: "action",
});

export const dayAction = fakeNode({
  props: { endpoint: "/lattice/actions/plan-day", method: "post", ref: "day-ref" },
  type: "action",
});

export function calendarNode(props: Partial<CalendarWireProps> = {}, id = "c1") {
  const defaults: CalendarWireProps = {
    views: ["month"],
    defaultView: "month",
    date: "2026-08-15",
    days: 7,
    groups: [],
    events: [],
    reschedulable: false,
    eventAction: null,
    dayAction: null,
    ref: "calendar-ref",
    endpoint: "/lattice/calendars/demo",
  };

  return fakeNode({ id, props: { ...defaults, ...props }, type: "calendar" });
}

/**
 * Renders the calendar shell with `props` merged over inert month-view
 * defaults, so a case spells out only the wire props it exercises.
 */
export function renderCalendar(props: Partial<CalendarWireProps> = {}, id = "c1"): RenderResult {
  const node = calendarNode(props, id);

  return renderWithRegistry(
    <CalendarComponent node={node}>{null}</CalendarComponent>,
    testRegistry,
  );
}

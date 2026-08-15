import type { Color, Node } from "@lattice-php/core";

export type Calendar = {
  date: string;
  dayAction: Node<"action"> | Node<"action.bulk"> | null;
  days: number;
  defaultView: CalendarView;
  endpoint: string | null;
  eventAction: Node<"action"> | Node<"action.bulk"> | null;
  events: CalendarEventData[];
  groups: ResourceGroupData[];
  ref: string | null;
  reschedulable: boolean;
  views: CalendarView[];
};
export type CalendarEventData = {
  readonly allDay: boolean;
  readonly color: Color | null;
  readonly context: Record<string, unknown>;
  readonly end: string;
  readonly id: string;
  readonly label: string;
  readonly resourceId: string | null;
  readonly start: string;
};
export type CalendarNodeType = "calendar";
export type CalendarView = "month" | "timeline";
export type ComponentPropsMap = {
  calendar: Calendar;
};
export type NodeType = "calendar";
export type ResourceGroupData = {
  readonly key: string;
  readonly label: string;
  readonly resources: {
    id: string;
    label: string;
  }[];
};

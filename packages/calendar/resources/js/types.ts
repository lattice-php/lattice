export type {
  Calendar as CalendarWireProps,
  CalendarEventData,
  CalendarView,
  ResourceGroupData,
} from "./generated";
import type { Calendar, ResourceGroupData } from "./generated";

export type CalendarResourceData = ResourceGroupData["resources"][number];

export type CalendarActionNode = NonNullable<Calendar["eventAction"]>;

/** Day-granular, half-open `[start, end)` — the shape the PATCH endpoint expects. */
export type CalendarRescheduleRequest = {
  id: string;
  resourceId: string;
  start: string;
  end: string;
};

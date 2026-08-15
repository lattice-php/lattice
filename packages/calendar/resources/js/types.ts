export type {
  Calendar as CalendarWireProps,
  CalendarEventData,
  CalendarView,
  ResourceGroupData,
} from "./generated";
import type { Calendar, ResourceGroupData } from "./generated";

export type CalendarResourceData = ResourceGroupData["resources"][number];

export type CalendarActionNode = NonNullable<Calendar["eventAction"]>;

/**
 * Half-open `[start, end)` in the event's own representation — `Y-m-d` bounds
 * for all-day events, wall-clock datetimes for timed ones. `resourceId` is
 * `null` for resource-less events; adapters validate what they accept.
 */
export type CalendarRescheduleRequest = {
  id: string;
  resourceId: string | null;
  start: string;
  end: string;
};

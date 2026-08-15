import { addDays } from "@lattice-php/ui/format/temporal";
import type { CalendarEventData } from "./types";

/**
 * The calendar days a wire event occupies, as a half-open `[start, end)` day
 * range: all-day events are day-granular already; a timed event occupies its
 * end's calendar day unless it ends exactly at midnight, which already is the
 * exclusive day bound.
 */
export function eventDaySpan(
  event: Pick<CalendarEventData, "start" | "end" | "allDay">,
): [string, string] {
  if (event.allDay) {
    return [event.start, event.end];
  }

  const startDay = event.start.slice(0, 10);
  const endDay = event.end.slice(0, 10);
  const exclusiveEnd = event.end.endsWith("T00:00:00") ? endDay : addDays(endDay, 1);

  return [startDay, exclusiveEnd > startDay ? exclusiveEnd : addDays(startDay, 1)];
}

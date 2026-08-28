import { CalendarEventData } from './types';
/**
 * The calendar days a wire event occupies, as a half-open `[start, end)` day
 * range: all-day events are day-granular already; a timed event occupies its
 * end's calendar day unless it ends exactly at midnight, which already is the
 * exclusive day bound.
 */
export declare function eventDaySpan(event: Pick<CalendarEventData, "start" | "end" | "allDay">): [string, string];
/**
 * Shifts an event by whole days in its own representation: all-day `Y-m-d`
 * bounds move as dates; a timed event keeps its wall-clock times and only the
 * date parts shift.
 */
export declare function shiftEventDays(event: Pick<CalendarEventData, "start" | "end">, days: number): {
    start: string;
    end: string;
};

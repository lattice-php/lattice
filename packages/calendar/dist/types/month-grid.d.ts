import { CalendarEventData } from "./types";
export type MonthDay = {
  date: string;
  dayOfMonth: number;
  inMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
};
export type MonthWeek = {
  start: string;
  days: MonthDay[];
};
export type MonthGrid = {
  monthStart: string;
  gridStart: string;
  gridEnd: string;
  weeks: MonthWeek[];
};
export declare function monthGridRange(monthISO: string, locale: string): [string, string];
export declare function buildMonthGrid(
  monthISO: string,
  locale: string,
  todayISO: string,
): MonthGrid;
export type MonthChip = {
  id: string;
  start: number;
  span: number;
  lane: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
  event: CalendarEventData;
};
/**
 * Clips every event overlapping the window to its `[0, dayCount)` day columns,
 * then packs the clipped chips into lanes. Lanes are assigned per row, so a
 * multi-week event keeps its column span but may change lanes between rows.
 */
export declare function weekChips(
  events: Iterable<CalendarEventData>,
  weekStart: string,
  dayCount?: number,
): {
  chips: MonthChip[];
  laneCount: number;
};
/**
 * Splits placed chips into the ones that fit the visible lanes and a per-day
 * count of hidden events feeding the "+N more" affordance.
 */
export declare function capLanes(
  chips: MonthChip[],
  maxVisibleLanes: number,
): {
  visible: MonthChip[];
  hiddenByDay: number[];
};
/** Every event occupying `date`, all-day spans first, then by start, then id. */
export declare function eventsOnDay(
  events: Iterable<CalendarEventData>,
  date: string,
): CalendarEventData[];

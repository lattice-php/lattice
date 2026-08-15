import {
  addDays,
  addMonths,
  daysBetween,
  startOfMonthISO,
  startOfWeekISO,
  weeksInMonth,
} from "@lattice-php/ui/format/temporal";
import { assignLanes } from "./date-axis";
import { eventDaySpan } from "./event-span";
import type { CalendarEventData } from "./types";

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

export function monthGridRange(monthISO: string, locale: string): [string, string] {
  const monthStart = startOfMonthISO(monthISO);
  const gridStart = startOfWeekISO(monthStart, locale);

  return [gridStart, addDays(gridStart, weeksInMonth(monthStart, locale) * 7)];
}

export function buildMonthGrid(monthISO: string, locale: string, todayISO: string): MonthGrid {
  const monthStart = startOfMonthISO(monthISO);
  const nextMonthStart = addMonths(monthStart, 1);
  const [gridStart, gridEnd] = monthGridRange(monthStart, locale);
  const weeks: MonthWeek[] = [];

  for (let start = gridStart; start < gridEnd; start = addDays(start, 7)) {
    const days: MonthDay[] = [];

    for (let index = 0; index < 7; index++) {
      const date = addDays(start, index);
      const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();

      days.push({
        date,
        dayOfMonth: Number(date.slice(8, 10)),
        inMonth: date >= monthStart && date < nextMonthStart,
        isToday: date === todayISO,
        isWeekend: weekday === 0 || weekday === 6,
      });
    }

    weeks.push({ start, days });
  }

  return { monthStart, gridStart, gridEnd, weeks };
}

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
 * Clips every event overlapping the week to its `[0, 7)` day columns, then
 * packs the clipped chips into lanes. Lanes are assigned per week row, so a
 * multi-week event keeps its column span but may change lanes between rows.
 */
export function weekChips(
  events: Iterable<CalendarEventData>,
  weekStart: string,
): { chips: MonthChip[]; laneCount: number } {
  const weekEnd = addDays(weekStart, 7);
  const clipped: (Omit<MonthChip, "lane"> & { order: string })[] = [];

  for (const event of events) {
    const [dayStart, dayEnd] = eventDaySpan(event);

    if (dayStart >= weekEnd || dayEnd <= weekStart) {
      continue;
    }

    const start = Math.max(0, daysBetween(weekStart, dayStart));
    const end = Math.min(7, daysBetween(weekStart, dayEnd));

    clipped.push({
      id: event.id,
      start,
      span: end - start,
      // Ties within a day column resolve all-day chips first, then by time.
      order: `${event.allDay ? "0" : "1"}|${event.start}|${event.id}`,
      continuesBefore: dayStart < weekStart,
      continuesAfter: dayEnd > weekEnd,
      event,
    });
  }

  const { bars, laneCount } = assignLanes(clipped);

  return { chips: bars, laneCount };
}

/**
 * Splits placed chips into the ones that fit the visible lanes and a per-day
 * count of hidden events feeding the "+N more" affordance.
 */
export function capLanes(
  chips: MonthChip[],
  maxVisibleLanes: number,
): { visible: MonthChip[]; hiddenByDay: number[] } {
  const hiddenByDay = [0, 0, 0, 0, 0, 0, 0];
  const visible: MonthChip[] = [];

  for (const chip of chips) {
    if (chip.lane < maxVisibleLanes) {
      visible.push(chip);
      continue;
    }

    for (let day = chip.start; day < chip.start + chip.span; day++) {
      hiddenByDay[day]++;
    }
  }

  return { visible, hiddenByDay };
}

/** Every event occupying `date`, all-day spans first, then by start, then id. */
export function eventsOnDay(
  events: Iterable<CalendarEventData>,
  date: string,
): CalendarEventData[] {
  const nextDay = addDays(date, 1);
  const matches: CalendarEventData[] = [];

  for (const event of events) {
    const [dayStart, dayEnd] = eventDaySpan(event);

    if (dayStart < nextDay && dayEnd > date) {
      matches.push(event);
    }
  }

  return matches.sort(
    (a, b) =>
      Number(b.allDay) - Number(a.allDay) ||
      (a.start < b.start ? -1 : a.start > b.start ? 1 : 0) ||
      a.id.localeCompare(b.id),
  );
}

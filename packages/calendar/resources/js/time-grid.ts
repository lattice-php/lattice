import { addDays, daysBetween, wallMinutesOfDay } from "@lattice-php/ui/format/temporal";
import { eventDaySpan } from "./event-span";
import type { CalendarEventData } from "./types";

export const MINUTES_PER_DAY = 24 * 60;

export const SNAP_MINUTES = 15;

/**
 * All-day events and anything spanning more than one calendar day render as
 * chips in the all-day row; only single-day timed events become positioned
 * blocks in the time grid.
 */
export function belongsInAllDayRow(event: CalendarEventData): boolean {
  if (event.allDay) {
    return true;
  }

  const [dayStart, dayEnd] = eventDaySpan(event);

  return daysBetween(dayStart, dayEnd) > 1;
}

export type TimedSegment = {
  event: CalendarEventData;
  startMin: number;
  endMin: number;
};

export type PositionedSegment = TimedSegment & {
  column: number;
  columns: number;
};

/** An end of exactly midnight belongs to the previous day as minute 1440. */
function endMinutes(event: CalendarEventData): number {
  return event.end.endsWith("T00:00:00") ? MINUTES_PER_DAY : wallMinutesOfDay(event.end);
}

/** Single-day timed events occupying `date`, as minute spans within that day. */
export function timedSegmentsOnDay(
  events: Iterable<CalendarEventData>,
  date: string,
): TimedSegment[] {
  const segments: TimedSegment[] = [];

  for (const event of events) {
    if (belongsInAllDayRow(event) || event.start.slice(0, 10) !== date) {
      continue;
    }

    segments.push({
      event,
      startMin: wallMinutesOfDay(event.start),
      endMin: endMinutes(event),
    });
  }

  return segments;
}

export function eventDurationMinutes(event: Pick<CalendarEventData, "start" | "end">): number {
  const startDay = event.start.slice(0, 10);
  const endDay = event.end.slice(0, 10);

  return (
    daysBetween(startDay, endDay) * MINUTES_PER_DAY +
    wallMinutesOfDay(event.end) -
    wallMinutesOfDay(event.start)
  );
}

/**
 * Cluster-based overlap layout: segments overlapping transitively share a
 * cluster and split its width into equal columns (each segment takes the
 * first column that is free at its start), so side-by-side events divide the
 * day column evenly while non-overlapping events keep the full width.
 */
export function layoutDayColumns(segments: TimedSegment[]): PositionedSegment[] {
  const sorted = [...segments].sort(
    (a, b) =>
      a.startMin - b.startMin || b.endMin - a.endMin || a.event.id.localeCompare(b.event.id),
  );
  const placed: PositionedSegment[] = [];
  let cluster: PositionedSegment[] = [];
  let columnEnds: number[] = [];
  let clusterEnd = -1;

  const closeCluster = (): void => {
    for (const segment of cluster) {
      segment.columns = columnEnds.length;
    }

    placed.push(...cluster);
    cluster = [];
    columnEnds = [];
  };

  for (const segment of sorted) {
    if (segment.startMin >= clusterEnd && cluster.length > 0) {
      closeCluster();
    }

    let column = columnEnds.findIndex((end) => end <= segment.startMin);

    if (column === -1) {
      column = columnEnds.length;
      columnEnds.push(segment.endMin);
    } else {
      columnEnds[column] = segment.endMin;
    }

    cluster.push({ ...segment, column, columns: 0 });
    clusterEnd = Math.max(clusterEnd, segment.endMin);
  }

  if (cluster.length > 0) {
    closeCluster();
  }

  return placed;
}

/** Snaps to the grid's step and clamps into the day, keeping `span` inside. */
export function snapMinute(minute: number, span = 0): number {
  const snapped = Math.round(minute / SNAP_MINUTES) * SNAP_MINUTES;

  return Math.max(0, Math.min(MINUTES_PER_DAY - span, snapped));
}

/** A day-local minute as a floating `Y-m-dTH:i:s` wire datetime; minute 1440 is the next day's midnight. */
export function minuteToWallTime(date: string, minute: number): string {
  if (minute >= MINUTES_PER_DAY) {
    return `${addDays(date, 1)}T00:00:00`;
  }

  const hours = String(Math.floor(minute / 60)).padStart(2, "0");
  const minutes = String(minute % 60).padStart(2, "0");

  return `${date}T${hours}:${minutes}:00`;
}

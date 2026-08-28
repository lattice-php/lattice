import { CalendarEventData } from './types';
export declare const MINUTES_PER_DAY: number;
export declare const SNAP_MINUTES = 15;
/**
 * All-day events and anything spanning more than one calendar day render as
 * chips in the all-day row; only single-day timed events become positioned
 * blocks in the time grid.
 */
export declare function belongsInAllDayRow(event: CalendarEventData): boolean;
export type TimedSegment = {
    event: CalendarEventData;
    startMin: number;
    endMin: number;
};
export type PositionedSegment = TimedSegment & {
    column: number;
    columns: number;
};
/** Single-day timed events occupying `date`, as minute spans within that day. */
export declare function timedSegmentsOnDay(events: Iterable<CalendarEventData>, date: string): TimedSegment[];
export declare function eventDurationMinutes(event: Pick<CalendarEventData, "start" | "end">): number;
/**
 * Cluster-based overlap layout: segments overlapping transitively share a
 * cluster and split its width into equal columns (each segment takes the
 * first column that is free at its start), so side-by-side events divide the
 * day column evenly while non-overlapping events keep the full width.
 */
export declare function layoutDayColumns(segments: TimedSegment[]): PositionedSegment[];
/** Snaps to the grid's step and clamps into the day, keeping `span` inside. */
export declare function snapMinute(minute: number, span?: number): number;
/** A day-local minute as a floating `Y-m-dTH:i:s` wire datetime; minute 1440 is the next day's midnight. */
export declare function minuteToWallTime(date: string, minute: number): string;

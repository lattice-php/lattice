export type AxisDay = {
    index: number;
    date: string;
    weekday: number;
    dayOfMonth: number;
    isWeekend: boolean;
    isToday: boolean;
};
export type AxisSegment = {
    start: number;
    span: number;
    label: string;
};
export type Axis = {
    start: string;
    days: AxisDay[];
    weeks: AxisSegment[];
    months: AxisSegment[];
};
export declare function buildAxis(startISO: string, dayCount: number, locale: string, todayISO: string): Axis;
/**
 * Greedy first-free-lane interval partitioning: sorted by (start asc, span
 * desc, order-or-id asc) for a deterministic, stable layout, then each bar
 * takes the first lane whose last-placed bar already ended at or before its
 * start — `end` is exclusive, so a bar starting exactly where another ends
 * shares a lane instead of stacking.
 */
export declare function assignLanes<T extends {
    id: string;
    start: number;
    span: number;
    order?: string;
}>(bars: T[]): {
    bars: (T & {
        lane: number;
    })[];
    laneCount: number;
};

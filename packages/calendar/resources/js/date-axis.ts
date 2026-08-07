/**
 * All date math runs at UTC noon so DST transitions in the reader's local
 * timezone never shift a day index — noon is far enough from any real-world
 * DST boundary (which always lands near midnight) that `setUTCDate` arithmetic
 * stays exact.
 */
const DAY_MS = 24 * 60 * 60 * 1000;

function toNoonUtc(dateISO: string): Date {
  return new Date(`${dateISO}T12:00:00Z`);
}

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export type DayIndex = number;

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

export function addDays(dateISO: string, days: number): string {
  const date = toNoonUtc(dateISO);
  date.setUTCDate(date.getUTCDate() + days);

  return toISO(date);
}

export function dayIndexOf(axisStartISO: string, dateISO: string): DayIndex {
  const start = toNoonUtc(axisStartISO).getTime();
  const target = toNoonUtc(dateISO).getTime();

  return Math.round((target - start) / DAY_MS);
}

/** ISO 8601 week number (Monday-start weeks, week 1 contains the year's first Thursday). */
export function isoWeek(dateISO: string): number {
  const date = toNoonUtc(dateISO);
  const dayOfWeek = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayOfWeek + 3);

  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const firstThursdayOffset = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayOffset + 3);

  return 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * DAY_MS));
}

/**
 * Groups consecutive axis days sharing a segment label into one span. Used for
 * both the months row (label = formatted month/year) and the weeks row (label
 * = ISO week number) — a segment only ever merges with its immediate
 * predecessor, so a label recurring later in a long window starts a new span
 * rather than merging across the gap.
 */
function buildSegments(dayCount: number, labelForDay: (index: number) => string): AxisSegment[] {
  const segments: AxisSegment[] = [];
  let currentLabel: string | null = null;
  let currentStart = 0;

  for (let index = 0; index < dayCount; index++) {
    const label = labelForDay(index);

    if (label !== currentLabel) {
      if (currentLabel !== null) {
        segments.push({ start: currentStart, span: index - currentStart, label: currentLabel });
      }

      currentLabel = label;
      currentStart = index;
    }
  }

  if (currentLabel !== null) {
    segments.push({ start: currentStart, span: dayCount - currentStart, label: currentLabel });
  }

  return segments;
}

export function buildAxis(
  startISO: string,
  dayCount: number,
  locale: string,
  todayISO: string,
): Axis {
  const monthFormatter = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
  const days: AxisDay[] = [];

  for (let index = 0; index < dayCount; index++) {
    const date = addDays(startISO, index);
    const noon = toNoonUtc(date);
    const weekday = noon.getUTCDay();

    days.push({
      index,
      date,
      weekday,
      dayOfMonth: noon.getUTCDate(),
      isWeekend: weekday === 0 || weekday === 6,
      isToday: date === todayISO,
    });
  }

  return {
    start: startISO,
    days,
    weeks: buildSegments(dayCount, (index) => String(isoWeek(days[index].date))),
    months: buildSegments(dayCount, (index) => monthFormatter.format(toNoonUtc(days[index].date))),
  };
}

/**
 * Greedy first-free-lane interval partitioning: sorted by (start asc, span
 * desc, id asc) for a deterministic, stable layout, then each bar takes the
 * first lane whose last-placed bar already ended at or before its start —
 * `end` is exclusive, so a bar starting exactly where another ends shares a
 * lane instead of stacking.
 */
export function assignLanes<T extends { id: string; start: number; span: number }>(
  bars: T[],
): { bars: (T & { lane: number })[]; laneCount: number } {
  const sorted = [...bars].sort(
    (a, b) => a.start - b.start || b.span - a.span || a.id.localeCompare(b.id),
  );
  const laneEnds: number[] = [];
  const placed: (T & { lane: number })[] = [];

  for (const bar of sorted) {
    const end = bar.start + bar.span;
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= bar.start);

    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = end;
    }

    placed.push({ ...bar, lane });
  }

  return { bars: placed, laneCount: laneEnds.length };
}

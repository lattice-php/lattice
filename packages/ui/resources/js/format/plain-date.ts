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

export function addDays(dateISO: string, days: number): string {
  const date = toNoonUtc(dateISO);
  date.setUTCDate(date.getUTCDate() + days);

  return toISO(date);
}

export function daysBetween(startISO: string, dateISO: string): number {
  const start = toNoonUtc(startISO).getTime();
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

/** Today's calendar date in `timeZone`, as `Y-m-d`. */
export function todayISO(timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

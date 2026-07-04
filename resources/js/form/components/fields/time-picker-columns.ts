export type TimeValue = { hour: number; minute: number; second: number };

export type TimeColumnOption = { value: number; label: string; disabled: boolean };

export type TimeColumns = {
  hours: TimeColumnOption[];
  minutes: TimeColumnOption[];
  seconds: TimeColumnOption[] | null;
};

type Bound = { hour: number; minute: number };

const timePattern = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;

export function parseTimeString(value: string | null | undefined): TimeValue | null {
  if (typeof value !== "string") {
    return null;
  }

  const match = timePattern.exec(value.trim());

  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = match[3] ? Number(match[3]) : 0;

  if (hour > 23 || minute > 59 || second > 59) {
    return null;
  }

  return { hour, minute, second };
}

export function formatTimeValue(value: TimeValue, withSeconds: boolean): string {
  const parts = [pad(value.hour), pad(value.minute)];

  if (withSeconds) {
    parts.push(pad(value.second));
  }

  return parts.join(":");
}

export function secondsEnabled(step: number | null | undefined): boolean {
  return step != null && step < 60;
}

export function buildTimeColumns(
  step: number | null | undefined,
  options: { min?: string | null; max?: string | null; current?: TimeValue | null } = {},
): TimeColumns {
  const { min, max, current } = options;
  const minBound = toBound(min);
  const maxBound = toBound(max);
  const minuteStep = step == null || step < 60 ? 1 : step % 60 === 0 ? step / 60 : 1;

  const hours = range(0, 23, 1).map((value) => ({
    value,
    label: pad(value),
    disabled:
      (minBound != null && value < minBound.hour) || (maxBound != null && value > maxBound.hour),
  }));

  const minuteValues = withValue(range(0, 59, minuteStep), current?.minute);
  const minutes = minuteValues.map((value) => ({
    value,
    label: pad(value),
    disabled: minuteDisabled(value, current, minBound, maxBound),
  }));

  const seconds = secondsEnabled(step)
    ? range(0, 59, 1).map((value) => ({ value, label: pad(value), disabled: false }))
    : null;

  return { hours, minutes, seconds };
}

function minuteDisabled(
  minute: number,
  current: TimeValue | null | undefined,
  minBound: Bound | null,
  maxBound: Bound | null,
): boolean {
  if (!current) {
    return false;
  }

  if (minBound != null && current.hour === minBound.hour && minute < minBound.minute) {
    return true;
  }

  if (maxBound != null && current.hour === maxBound.hour && minute > maxBound.minute) {
    return true;
  }

  return false;
}

function toBound(value: string | null | undefined): Bound | null {
  const parsed = parseTimeString(value);

  return parsed ? { hour: parsed.hour, minute: parsed.minute } : null;
}

function withValue(values: number[], extra: number | undefined): number[] {
  if (extra == null || values.includes(extra)) {
    return values;
  }

  return [...values, extra].sort((left, right) => left - right);
}

function range(start: number, end: number, step: number): number[] {
  const values: number[] = [];

  for (let value = start; value <= end; value += step) {
    values.push(value);
  }

  return values;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

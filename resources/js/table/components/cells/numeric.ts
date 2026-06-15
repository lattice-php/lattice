/** Parses a cell value to a finite number, or null when it isn't numeric. */
export function numericValue(value: unknown): number | null {
  const number = typeof value === "number" ? value : Number(value);

  return value !== null && value !== undefined && value !== "" && !Number.isNaN(number)
    ? number
    : null;
}

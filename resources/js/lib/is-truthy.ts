/** Coerce a wire value (boolean, `1`/`0`, `"1"`/`"true"`) to a boolean. */
export function isTruthy(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

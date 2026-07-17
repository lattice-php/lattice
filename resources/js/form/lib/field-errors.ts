export type FieldErrors = Record<string, string | undefined>;

/** Reduce a Laravel 422 error bag (arrays of messages) to the first per field. */
export function firstErrors(errors: Record<string, string[] | string> | undefined): FieldErrors {
  const result: FieldErrors = {};

  for (const [key, value] of Object.entries(errors ?? {})) {
    result[key] = Array.isArray(value) ? value[0] : value;
  }

  return result;
}

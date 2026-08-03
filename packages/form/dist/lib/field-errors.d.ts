export type FieldErrors = Record<string, string | undefined>;
/** Whether an error-bag key targets the named field itself or a path nested under it. */
export declare function errorKeyBelongsTo(key: string, name: string): boolean;
/** Reduce a Laravel 422 error bag (arrays of messages) to the first per field. */
export declare function firstErrors(errors: Record<string, string[] | string> | undefined): FieldErrors;

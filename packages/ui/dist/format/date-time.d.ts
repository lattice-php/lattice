import { DateTimeStyle } from '../types.js';
export type FormatOptions = {
    locale?: string;
    timeZone?: string;
};
export type DateConfig = {
    dateStyle: DateTimeStyle | null;
    timeStyle: DateTimeStyle | null;
    month?: string | null;
    year?: string | null;
};
export declare function formatDateValue(value: unknown, date: DateConfig, options?: FormatOptions): string;
export declare function toDate(value: unknown): Date | null;
export declare function preciseDateTime(value: unknown, options?: FormatOptions): string;

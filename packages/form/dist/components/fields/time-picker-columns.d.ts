export type TimeValue = {
    hour: number;
    minute: number;
    second: number;
};
export type TimeColumnOption = {
    value: number;
    label: string;
    disabled: boolean;
};
type TimeColumns = {
    hours: TimeColumnOption[];
    minutes: TimeColumnOption[];
    seconds: TimeColumnOption[] | null;
};
export declare function parseTimeString(value: string | null | undefined): TimeValue | null;
export declare function formatTimeValue(value: TimeValue, withSeconds: boolean): string;
export declare function secondsEnabled(step: number | null | undefined): boolean;
export declare function buildTimeColumns(step: number | null | undefined, options?: {
    min?: string | null;
    max?: string | null;
    current?: TimeValue | null;
}): TimeColumns;
export {};

import { TimeValue } from './time-picker-columns.js';
type TimePickerProps = {
    value: TimeValue | null;
    onChange: (next: TimeValue) => void;
    step?: number | null;
    min?: string | null;
    max?: string | null;
    disabled?: boolean;
    readOnly?: boolean;
    labels?: {
        hour?: string;
        minute?: string;
        second?: string;
    };
    testId?: string;
};
export declare function TimePicker({ value, onChange, step, min, max, disabled, readOnly, labels, testId, }: TimePickerProps): import("react").JSX.Element;
export {};

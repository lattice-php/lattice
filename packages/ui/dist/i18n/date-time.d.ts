import { ReactNode } from 'react';
import { DateTimeStyle } from '../types.js';
export type DateTimeProps = {
    value: unknown;
    dateStyle?: DateTimeStyle | null;
    timeStyle?: DateTimeStyle | null;
};
export declare function DateTime({ value, dateStyle, timeStyle, }: DateTimeProps): ReactNode;

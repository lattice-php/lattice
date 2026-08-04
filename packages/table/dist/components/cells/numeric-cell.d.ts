import { ReactNode } from 'react';
import { NumberFormat } from '@lattice-php/core/generated';
import { TableColumn } from '../../types.js';
/** Shared numeric cell body for the money and number columns. */
export declare function NumericCell({ column, copyable, format, value, }: {
    column: TableColumn;
    copyable?: boolean | null;
    format: NumberFormat;
    value: unknown;
}): ReactNode;

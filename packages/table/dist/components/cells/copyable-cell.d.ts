import { ReactNode } from 'react';
import { TableColumn } from '../../types.js';
/** Wrap cell content in a copy-to-clipboard affordance when `copyable` is set. */
export declare function CopyableCell({ children, column, copyable, value, }: {
    children: ReactNode;
    column: TableColumn;
    copyable?: boolean | null;
    value: string;
}): ReactNode;

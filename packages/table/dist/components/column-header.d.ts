import { HTMLAttributes } from 'react';
import { TableColumn, TableQuery } from '../types.js';
export declare function ColumnHeader({ column, processing, resizeHandleProps, sort, query, }: {
    column: TableColumn;
    processing: boolean;
    resizeHandleProps?: HTMLAttributes<HTMLDivElement>;
    sort: (column: TableColumn) => void;
    query: TableQuery;
}): import("react").JSX.Element;

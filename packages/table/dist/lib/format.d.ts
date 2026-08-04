import { FormatOptions } from '../../../../ui/dist/format/date-time.js';
import { TableColumn, TableRow } from '../types.js';
export declare function formatCell(value: unknown, column?: TableColumn, options?: FormatOptions): string;
export declare function resolveLink(column: TableColumn, row: TableRow, value: unknown): string | null;

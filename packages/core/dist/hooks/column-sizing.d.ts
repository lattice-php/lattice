import { ColumnWidth } from "../generated.js";
export type SizableColumn = {
  key: string;
  label?: string | null;
  width: ColumnWidth;
};
export declare const DEFAULT_COLUMN_WIDTH: ColumnWidth;
export declare const maxColumnWidthPx = 1024;
export declare function columnWidthTrack(width: ColumnWidth): string;
export declare function minColumnWidthPx(column: SizableColumn): number;
export declare function defaultColumnWidthPx(column: SizableColumn): number;
export declare function buildColumnGridTemplate({
  columns,
  leadingTracks,
  trailingTracks,
  overrides,
}: {
  columns: SizableColumn[];
  leadingTracks?: string[];
  trailingTracks?: string[];
  overrides?: Record<string, number | undefined>;
}): string;

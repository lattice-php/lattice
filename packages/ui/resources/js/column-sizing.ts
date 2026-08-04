import type { ColumnWidth } from "./types";

export type SizableColumn = {
  key: string;
  label?: string | null;
  width: ColumnWidth;
};

export const DEFAULT_COLUMN_WIDTH: ColumnWidth = "md";

const tracks: Record<ColumnWidth, { track: string; minPx: number; defaultPx: number }> = {
  xs: { track: "minmax(4rem, 0.35fr)", minPx: 64, defaultPx: 96 },
  sm: { track: "minmax(6rem, 0.5fr)", minPx: 96, defaultPx: 128 },
  md: { track: "minmax(8rem, 1fr)", minPx: 128, defaultPx: 176 },
  lg: { track: "minmax(12rem, 1.5fr)", minPx: 192, defaultPx: 240 },
  xl: { track: "minmax(16rem, 2fr)", minPx: 256, defaultPx: 320 },
};

export const maxColumnWidthPx = 1024;

export function columnWidthTrack(width: ColumnWidth): string {
  return tracks[width].track;
}

export function minColumnWidthPx(column: SizableColumn): number {
  return tracks[column.width].minPx;
}

export function defaultColumnWidthPx(column: SizableColumn): number {
  return tracks[column.width].defaultPx;
}

export function buildColumnGridTemplate({
  columns,
  leadingTracks = [],
  trailingTracks = [],
  overrides = {},
}: {
  columns: SizableColumn[];
  leadingTracks?: string[];
  trailingTracks?: string[];
  overrides?: Record<string, number | undefined>;
}): string {
  return [
    ...leadingTracks,
    ...columns.map((column) => {
      const override = overrides[column.key];

      if (override !== undefined) {
        return `${Math.min(maxColumnWidthPx, Math.max(minColumnWidthPx(column), override))}px`;
      }

      return columnWidthTrack(column.width);
    }),
    ...trailingTracks,
  ].join(" ");
}

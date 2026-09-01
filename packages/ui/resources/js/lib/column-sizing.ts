import type { ColumnWidth, Side } from "../types";

export type SizableColumn = {
  key: string;
  label?: string | null;
  pin?: Side;
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

function clampWidthPx(column: SizableColumn, px: number): number {
  return Math.min(maxColumnWidthPx, Math.max(minColumnWidthPx(column), px));
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
  if (columns.some((column) => column.pin != null)) {
    return buildPinnedGridTemplate({ columns, leadingTracks, trailingTracks, overrides });
  }

  return [
    ...leadingTracks,
    ...columns.map((column) => {
      const override = overrides[column.key];

      if (override !== undefined) {
        return `${clampWidthPx(column, override)}px`;
      }

      return columnWidthTrack(column.width);
    }),
    ...trailingTracks,
  ].join(" ");
}

function buildPinnedGridTemplate({
  columns,
  leadingTracks,
  trailingTracks,
  overrides,
}: {
  columns: SizableColumn[];
  leadingTracks: string[];
  trailingTracks: string[];
  overrides: Record<string, number | undefined>;
}): string {
  const tracks = columns.map(
    (column) => `${clampWidthPx(column, overrides[column.key] ?? defaultColumnWidthPx(column))}px`,
  );
  const fillerIndex = columns.findIndex((column) => column.pin === "end");

  tracks.splice(fillerIndex === -1 ? tracks.length : fillerIndex, 0, "minmax(0, 1fr)");

  return [...leadingTracks, ...tracks, ...trailingTracks].join(" ");
}

export function buildPinnedOffsets({
  columns,
  leadingTracks = [],
  trailingTracks = [],
  overrides = {},
  hasExpander = false,
  hasSelection = false,
  hasActions = false,
}: {
  columns: SizableColumn[];
  leadingTracks?: string[];
  trailingTracks?: string[];
  overrides?: Record<string, number | undefined>;
  hasExpander?: boolean;
  hasSelection?: boolean;
  hasActions?: boolean;
}): Record<string, string> {
  if (!columns.some((column) => column.pin != null)) {
    return {};
  }

  const widthOf = (column: SizableColumn): number =>
    clampWidthPx(column, overrides[column.key] ?? defaultColumnWidthPx(column));
  const leadingRem = sumRemTracks(leadingTracks);
  const trailingRem = sumRemTracks(trailingTracks);
  const offsets: Record<string, string> = {};

  let leftPx = 0;
  columns.forEach((column, index) => {
    if (column.pin !== "start") {
      return;
    }

    offsets[`--lt-pin-offset-${index}`] = formatOffset(leadingRem, leftPx);
    leftPx += widthOf(column);
  });

  let rightPx = 0;
  for (let index = columns.length - 1; index >= 0; index -= 1) {
    const column = columns[index];

    if (column.pin !== "end") {
      continue;
    }

    offsets[`--lt-pin-offset-${index}`] = formatOffset(trailingRem, rightPx);
    rightPx += widthOf(column);
  }

  if (hasExpander) {
    offsets["--lt-pin-offset-expander"] = "0px";
  }

  if (hasSelection) {
    offsets["--lt-pin-offset-selection"] = hasExpander
      ? formatOffset(sumRemTracks(leadingTracks.slice(0, 1)), 0)
      : "0px";
  }

  if (hasActions) {
    offsets["--lt-pin-offset-actions"] = "0px";
  }

  return offsets;
}

function sumRemTracks(tracks: string[]): number {
  return tracks.reduce((sum, track) => sum + parseRem(track), 0);
}

function parseRem(track: string): number {
  const match = track.trim().match(/^([0-9.]+)rem$/);

  return match ? Number.parseFloat(match[1]) : 0;
}

function formatOffset(remSum: number, pxSum: number): string {
  if (remSum === 0 && pxSum === 0) {
    return "0px";
  }

  if (remSum === 0) {
    return `${pxSum}px`;
  }

  if (pxSum === 0) {
    return `${remSum}rem`;
  }

  return `calc(${remSum}rem + ${pxSum}px)`;
}

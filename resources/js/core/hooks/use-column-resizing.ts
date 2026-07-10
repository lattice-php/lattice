import type { HTMLAttributes, KeyboardEvent, PointerEvent } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  buildColumnGridTemplate,
  defaultColumnWidthPx,
  maxColumnWidthPx,
  minColumnWidthPx,
  type SizableColumn,
} from "./column-sizing";

type DragState = {
  key: string;
  maxWidth: number;
  overrides: Record<string, number | undefined> | null;
  startWidth: number;
  startX: number;
};

type ResizeHandleProps = HTMLAttributes<HTMLDivElement> & {
  "aria-label": string;
  "aria-orientation": "vertical";
  "aria-valuemax": number;
  "aria-valuemin": number;
  "aria-valuenow": number;
  role: "separator";
  tabIndex: number;
};

type StoredColumnWidths = {
  columns: string[];
  overrides: Record<string, number>;
};

const emptyTracks: string[] = [];

export function useColumnResizing({
  columnGapPx = 0,
  columns,
  enabled,
  leadingTracks = emptyTracks,
  showIndicator = false,
  storageKey,
  trailingTracks = emptyTracks,
}: {
  columnGapPx?: number;
  columns: SizableColumn[];
  enabled: boolean;
  leadingTracks?: string[];
  showIndicator?: boolean;
  storageKey?: string;
  trailingTracks?: string[];
}) {
  const columnKeys = useMemo(() => columns.map((column) => column.key), [columns]);
  const [overrides, setOverrides] = useState<Record<string, number | undefined>>(() =>
    readStoredOverrides(storageKey, columns),
  );
  const overridesRef = useRef(overrides);
  const drag = useRef<DragState | null>(null);
  const resizeRootRef = useRef<HTMLDivElement | null>(null);

  const templateForOverrides = useCallback(
    (nextOverrides: Record<string, number | undefined>): string =>
      buildColumnGridTemplate({
        columns,
        leadingTracks,
        trailingTracks,
        overrides: enabled ? nextOverrides : {},
      }),
    [columns, enabled, leadingTracks, trailingTracks],
  );

  const gridTemplateColumns = useMemo(
    () => templateForOverrides(overrides),
    [overrides, templateForOverrides],
  );

  const applyTemplate = useCallback((template: string): void => {
    const root = resizeRootRef.current;

    if (!root) {
      return;
    }

    root.style.gridTemplateColumns = template;
    root.style.setProperty("--lattice-table-columns", template);
  }, []);

  const commitOverrides = useCallback(
    (next: Record<string, number | undefined>) => {
      overridesRef.current = next;
      setOverrides(next);
      writeStoredOverrides(storageKey, columnKeys, next);
      applyTemplate(templateForOverrides(next));
    },
    [applyTemplate, columnKeys, storageKey, templateForOverrides],
  );

  const overridesWithColumnWidth = useCallback(
    (
      current: Record<string, number | undefined>,
      column: SizableColumn,
      width: number,
      maxWidth?: number,
    ): Record<string, number | undefined> => ({
      ...current,
      [column.key]: Math.min(
        maxWidth ?? maxColumnWidthPx(column),
        Math.max(minColumnWidthPx(column), width),
      ),
    }),
    [],
  );

  const setColumnWidth = useCallback(
    (column: SizableColumn, width: number, maxWidth?: number) => {
      commitOverrides(overridesWithColumnWidth(overridesRef.current, column, width, maxWidth));
    },
    [commitOverrides, overridesWithColumnWidth],
  );

  const resetColumnWidth = useCallback(
    (column: SizableColumn) => {
      const next = { ...overridesRef.current };
      delete next[column.key];

      commitOverrides(next);
    },
    [commitOverrides],
  );

  const resetColumns = useCallback(() => {
    commitOverrides({});
  }, [commitOverrides]);

  const hasOverrides =
    enabled && Object.values(overrides).some((width) => typeof width === "number");

  const currentColumnWidth = useCallback(
    (column: SizableColumn): number =>
      overridesRef.current[column.key] ?? defaultColumnWidthPx(column),
    [],
  );

  const getResizeHandleProps = useCallback(
    (column: SizableColumn): ResizeHandleProps => {
      const max = maxColumnWidthPx(column);
      const min = minColumnWidthPx(column);
      const current = currentColumnWidth(column);
      const label = column.label ?? column.key;
      const indicatorClass = showIndicator ? "after:bg-lt-border" : "after:bg-transparent";

      const maxWidthForHandle = (handle: HTMLDivElement): number =>
        maxColumnWidthForGrid({
          column,
          columnGapPx,
          columns,
          grid: resizeRootRef.current ?? handle.parentElement?.parentElement,
          leadingTracks,
          trailingTracks,
        });

      const resizeBy = (handle: HTMLDivElement, delta: number): void =>
        setColumnWidth(column, current + delta, maxWidthForHandle(handle));

      return {
        "aria-label": `Resize ${label}`,
        "aria-orientation": "vertical",
        "aria-valuemax": max,
        "aria-valuemin": min,
        "aria-valuenow": current,
        className: `absolute inset-y-0 right-0 hidden w-2 cursor-col-resize touch-none items-stretch justify-center md:flex after:my-1 after:w-px ${indicatorClass} hover:after:bg-lt-border focus-visible:outline-none focus-visible:after:bg-lt-ring`,
        onDoubleClick: () => resetColumnWidth(column),
        onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
          if (!enabled) {
            return;
          }

          const step = event.shiftKey ? 32 : 8;

          if (event.key === "ArrowLeft") {
            event.preventDefault();
            resizeBy(event.currentTarget, -step);
          }

          if (event.key === "ArrowRight") {
            event.preventDefault();
            resizeBy(event.currentTarget, step);
          }

          if (event.key === "Home") {
            event.preventDefault();
            setColumnWidth(column, min);
          }

          if (event.key === "End") {
            event.preventDefault();
            const handleMax = maxWidthForHandle(event.currentTarget);
            setColumnWidth(column, handleMax, handleMax);
          }

          if (event.key === "Enter" || event.key === "Escape") {
            event.preventDefault();
            resetColumnWidth(column);
          }
        },
        onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
          if (!enabled) {
            return;
          }

          const parentWidth = event.currentTarget.parentElement?.getBoundingClientRect().width ?? 0;
          drag.current = {
            key: column.key,
            maxWidth: maxWidthForHandle(event.currentTarget),
            overrides: null,
            startWidth: parentWidth > 0 ? parentWidth : current,
            startX: event.clientX,
          };
          event.currentTarget.setPointerCapture?.(event.pointerId);
          event.preventDefault();
        },
        onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
          const active = drag.current;

          if (!enabled || active?.key !== column.key) {
            return;
          }

          const next = overridesWithColumnWidth(
            overridesRef.current,
            column,
            active.startWidth + event.clientX - active.startX,
            active.maxWidth,
          );

          active.overrides = next;
          overridesRef.current = next;
          applyTemplate(templateForOverrides(next));
        },
        onPointerUp: (event: PointerEvent<HTMLDivElement>) => {
          const active = drag.current;

          if (active?.key !== column.key) {
            return;
          }

          drag.current = null;
          if (active.overrides !== null) {
            commitOverrides(active.overrides);
          }
          event.currentTarget.releasePointerCapture?.(event.pointerId);
        },
        role: "separator",
        tabIndex: 0,
      };
    },
    [
      columnGapPx,
      columns,
      currentColumnWidth,
      enabled,
      leadingTracks,
      applyTemplate,
      commitOverrides,
      overridesWithColumnWidth,
      resetColumnWidth,
      setColumnWidth,
      showIndicator,
      templateForOverrides,
      trailingTracks,
    ],
  );

  return {
    getResizeHandleProps,
    gridTemplateColumns,
    hasOverrides,
    resizeRootRef,
    resetColumns,
    resetColumnWidth,
  };
}

function maxColumnWidthForGrid({
  column,
  columnGapPx,
  columns,
  grid,
  leadingTracks,
  trailingTracks,
}: {
  column: SizableColumn;
  columnGapPx: number;
  columns: SizableColumn[];
  grid: Element | null | undefined;
  leadingTracks: string[];
  trailingTracks: string[];
}): number {
  const gridWidth = grid?.getBoundingClientRect().width ?? 0;

  if (gridWidth <= 0) {
    return maxColumnWidthPx(column);
  }

  const utilityWidth = [...leadingTracks, ...trailingTracks].reduce(
    (sum, track) => sum + fixedTrackWidthPx(track),
    0,
  );
  const siblingMinWidth = columns.reduce(
    (sum, sibling) => (sibling.key === column.key ? sum : sum + minColumnWidthPx(sibling)),
    0,
  );
  const trackCount = columns.length + leadingTracks.length + trailingTracks.length;
  const gapWidth = Math.max(0, trackCount - 1) * columnGapPx;
  const available = gridWidth - utilityWidth - siblingMinWidth - gapWidth;

  return Math.min(maxColumnWidthPx(column), Math.max(minColumnWidthPx(column), available));
}

function readStoredOverrides(
  storageKey: string | undefined,
  columns: SizableColumn[],
): Record<string, number | undefined> {
  if (!storageKey || typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(storageKey);

    if (raw === null) {
      return {};
    }

    const stored = JSON.parse(raw) as unknown;

    if (!isStoredColumnWidths(stored)) {
      removeStoredOverrides(storageKey);

      return {};
    }

    const overrides = sanitizeOverrides(stored.overrides, columns);

    if (Object.keys(overrides).length === 0) {
      removeStoredOverrides(storageKey);
    }

    return overrides;
  } catch {
    removeStoredOverrides(storageKey);

    return {};
  }
}

function writeStoredOverrides(
  storageKey: string | undefined,
  columnKeys: string[],
  overrides: Record<string, number | undefined>,
): void {
  if (!storageKey || typeof window === "undefined") {
    return;
  }

  const stored: Record<string, number> = {};
  const knownKeys = new Set(columnKeys);

  for (const [key, value] of Object.entries(overrides)) {
    if (knownKeys.has(key) && typeof value === "number" && Number.isFinite(value)) {
      stored[key] = value;
    }
  }

  if (Object.keys(stored).length === 0) {
    removeStoredOverrides(storageKey);

    return;
  }

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        columns: columnKeys,
        overrides: stored,
      }),
    );
  } catch {
    return;
  }
}

function removeStoredOverrides(storageKey: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    return;
  }
}

function isStoredColumnWidths(value: unknown): value is StoredColumnWidths {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    Array.isArray(record.columns) &&
    record.columns.every((column) => typeof column === "string") &&
    typeof record.overrides === "object" &&
    record.overrides !== null &&
    !Array.isArray(record.overrides)
  );
}

function sanitizeOverrides(
  overrides: Record<string, unknown>,
  columns: SizableColumn[],
): Record<string, number | undefined> {
  const next: Record<string, number | undefined> = {};

  for (const column of columns) {
    const value = overrides[column.key];

    if (typeof value !== "number" || !Number.isFinite(value)) {
      continue;
    }

    next[column.key] = Math.min(
      maxColumnWidthPx(column),
      Math.max(minColumnWidthPx(column), value),
    );
  }

  return next;
}

function fixedTrackWidthPx(track: string): number {
  const value = track.trim();
  const px = value.match(/^([0-9.]+)px$/);

  if (px) {
    return Number.parseFloat(px[1]);
  }

  const rem = value.match(/^([0-9.]+)rem$/);

  if (rem) {
    return Number.parseFloat(rem[1]) * rootFontSizePx();
  }

  return 0;
}

function rootFontSizePx(): number {
  if (typeof window === "undefined") {
    return 16;
  }

  const parsed = Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 16;
}

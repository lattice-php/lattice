import type { HTMLAttributes, KeyboardEvent, PointerEvent } from "react";
import { useCallback, useMemo, useRef } from "react";
import { usePersistentState } from "./use-persistent-state";
import {
  buildColumnGridTemplate,
  buildPinnedOffsets,
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

const emptyTracks: string[] = [];

export function useColumnResizing({
  columnGapPx = 0,
  columns,
  enabled,
  hasActions = false,
  hasExpander = false,
  hasSelection = false,
  leadingTracks = emptyTracks,
  showIndicator = false,
  storageKey,
  trailingTracks = emptyTracks,
}: {
  columnGapPx?: number;
  columns: SizableColumn[];
  enabled: boolean;
  hasActions?: boolean;
  hasExpander?: boolean;
  hasSelection?: boolean;
  leadingTracks?: string[];
  showIndicator?: boolean;
  storageKey?: string;
  trailingTracks?: string[];
}) {
  const columnKeys = useMemo(() => columns.map((column) => column.key), [columns]);
  const [overrides, setOverrides] = usePersistentState<Record<string, number | undefined>>(
    storageKey ?? "",
    {},
    {
      enabled: Boolean(storageKey),
      parse: (raw) => parseStoredOverrides(raw, columns),
      serialize: (value) => serializeOverrides(value, columnKeys),
    },
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

  const pinOffsetsForOverrides = useCallback(
    (nextOverrides: Record<string, number | undefined>): Record<string, string> =>
      buildPinnedOffsets({
        columns,
        hasActions,
        hasExpander,
        hasSelection,
        leadingTracks,
        overrides: enabled ? nextOverrides : {},
        trailingTracks,
      }),
    [columns, enabled, hasActions, hasExpander, hasSelection, leadingTracks, trailingTracks],
  );

  const gridTemplateColumns = useMemo(
    () => templateForOverrides(overrides),
    [overrides, templateForOverrides],
  );

  const pinOffsetVars = useMemo(
    () => pinOffsetsForOverrides(overrides),
    [overrides, pinOffsetsForOverrides],
  );

  const appliedPinVarsRef = useRef<string[]>([]);

  const applyTemplate = useCallback((template: string, offsets: Record<string, string>): void => {
    const root = resizeRootRef.current;

    if (!root) {
      return;
    }

    root.style.gridTemplateColumns = template;
    root.style.setProperty("--lattice-table-columns", template);

    for (const key of appliedPinVarsRef.current) {
      if (!(key in offsets)) {
        root.style.removeProperty(key);
      }
    }

    for (const [key, value] of Object.entries(offsets)) {
      root.style.setProperty(key, value);
    }

    appliedPinVarsRef.current = Object.keys(offsets);
  }, []);

  const applyOverrides = useCallback(
    (next: Record<string, number | undefined>): void => {
      applyTemplate(templateForOverrides(next), pinOffsetsForOverrides(next));
    },
    [applyTemplate, pinOffsetsForOverrides, templateForOverrides],
  );

  const commitOverrides = useCallback(
    (next: Record<string, number | undefined>) => {
      overridesRef.current = next;
      setOverrides(next);
      applyOverrides(next);
    },
    [applyOverrides, setOverrides],
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
        maxWidth ?? maxColumnWidthPx,
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
      const max = maxColumnWidthPx;
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

      const finishDrag = (event: PointerEvent<HTMLDivElement>, releaseCapture: boolean): void => {
        const active = drag.current;

        if (active?.key !== column.key) {
          return;
        }

        drag.current = null;
        if (active.overrides !== null) {
          commitOverrides(active.overrides);
        }

        if (releaseCapture) {
          event.currentTarget.releasePointerCapture?.(event.pointerId);
        }
      };

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
          applyOverrides(next);
        },
        onPointerUp: (event: PointerEvent<HTMLDivElement>) => {
          finishDrag(event, true);
        },
        onPointerCancel: (event: PointerEvent<HTMLDivElement>) => {
          finishDrag(event, true);
        },
        onLostPointerCapture: (event: PointerEvent<HTMLDivElement>) => {
          finishDrag(event, false);
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
      applyOverrides,
      commitOverrides,
      overridesWithColumnWidth,
      resetColumnWidth,
      setColumnWidth,
      showIndicator,
      trailingTracks,
    ],
  );

  return {
    getResizeHandleProps,
    gridTemplateColumns,
    hasOverrides,
    pinOffsetVars,
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
    return maxColumnWidthPx;
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

  return Math.min(maxColumnWidthPx, Math.max(minColumnWidthPx(column), available));
}

function parseStoredOverrides(
  raw: string,
  columns: SizableColumn[],
): Record<string, number | undefined> {
  const stored = JSON.parse(raw) as { overrides?: unknown };
  const overrides = stored?.overrides;

  if (typeof overrides !== "object" || overrides === null || Array.isArray(overrides)) {
    throw new Error("unexpected stored column widths shape");
  }

  const sanitized = sanitizeOverrides(overrides as Record<string, unknown>, columns);

  if (Object.keys(sanitized).length === 0) {
    throw new Error("stored column widths hold no usable overrides");
  }

  return sanitized;
}

function serializeOverrides(
  overrides: Record<string, number | undefined>,
  columnKeys: string[],
): string | null {
  const stored: Record<string, number> = {};
  const knownKeys = new Set(columnKeys);

  for (const [key, value] of Object.entries(overrides)) {
    if (knownKeys.has(key) && typeof value === "number" && Number.isFinite(value)) {
      stored[key] = value;
    }
  }

  if (Object.keys(stored).length === 0) {
    return null;
  }

  return JSON.stringify({ overrides: stored });
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

    next[column.key] = Math.min(maxColumnWidthPx, Math.max(minColumnWidthPx(column), value));
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

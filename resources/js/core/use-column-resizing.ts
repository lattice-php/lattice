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

export function useColumnResizing({
  columnGapPx = 0,
  columns,
  enabled,
  leadingTracks = [],
  showIndicator = false,
  trailingTracks = [],
}: {
  columnGapPx?: number;
  columns: SizableColumn[];
  enabled: boolean;
  leadingTracks?: string[];
  showIndicator?: boolean;
  trailingTracks?: string[];
}) {
  const [overrides, setOverrides] = useState<Record<string, number | undefined>>({});
  const drag = useRef<DragState | null>(null);

  const gridTemplateColumns = useMemo(
    () =>
      buildColumnGridTemplate({
        columns,
        leadingTracks,
        trailingTracks,
        overrides: enabled ? overrides : {},
      }),
    [columns, enabled, leadingTracks, overrides, trailingTracks],
  );

  const setColumnWidth = useCallback((column: SizableColumn, width: number, maxWidth?: number) => {
    setOverrides((current) => ({
      ...current,
      [column.key]: Math.min(
        maxWidth ?? maxColumnWidthPx(column),
        Math.max(minColumnWidthPx(column), width),
      ),
    }));
  }, []);

  const resetColumnWidth = useCallback((column: SizableColumn) => {
    setOverrides((current) => {
      const next = { ...current };
      delete next[column.key];

      return next;
    });
  }, []);

  const currentColumnWidth = useCallback(
    (column: SizableColumn): number => overrides[column.key] ?? defaultColumnWidthPx(column),
    [overrides],
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
          grid: handle.parentElement?.parentElement,
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

          setColumnWidth(
            column,
            active.startWidth + event.clientX - active.startX,
            active.maxWidth,
          );
        },
        onPointerUp: (event: PointerEvent<HTMLDivElement>) => {
          const active = drag.current;

          if (active?.key !== column.key) {
            return;
          }

          drag.current = null;
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
      resetColumnWidth,
      setColumnWidth,
      showIndicator,
      trailingTracks,
    ],
  );

  return {
    getResizeHandleProps,
    gridTemplateColumns,
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

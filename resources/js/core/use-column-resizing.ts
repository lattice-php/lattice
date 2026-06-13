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
  columns,
  enabled,
  leadingTracks = [],
  trailingTracks = [],
}: {
  columns: SizableColumn[];
  enabled: boolean;
  leadingTracks?: string[];
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

  const setColumnWidth = useCallback((column: SizableColumn, width: number) => {
    setOverrides((current) => ({
      ...current,
      [column.key]: Math.min(maxColumnWidthPx(column), Math.max(minColumnWidthPx(column), width)),
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

      const resizeBy = (delta: number): void => setColumnWidth(column, current + delta);

      return {
        "aria-label": `Resize ${label}`,
        "aria-orientation": "vertical",
        "aria-valuemax": max,
        "aria-valuemin": min,
        "aria-valuenow": current,
        className:
          "absolute inset-y-0 right-0 hidden w-2 cursor-col-resize touch-none items-stretch justify-center md:flex after:my-1 after:w-px after:bg-transparent hover:after:bg-lt-border focus-visible:outline-none focus-visible:after:bg-lt-ring",
        onDoubleClick: () => resetColumnWidth(column),
        onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
          if (!enabled) {
            return;
          }

          const step = event.shiftKey ? 32 : 8;

          if (event.key === "ArrowLeft") {
            event.preventDefault();
            resizeBy(-step);
          }

          if (event.key === "ArrowRight") {
            event.preventDefault();
            resizeBy(step);
          }

          if (event.key === "Home") {
            event.preventDefault();
            setColumnWidth(column, min);
          }

          if (event.key === "End") {
            event.preventDefault();
            setColumnWidth(column, max);
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

          setColumnWidth(column, active.startWidth + event.clientX - active.startX);
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
    [currentColumnWidth, enabled, resetColumnWidth, setColumnWidth],
  );

  return {
    getResizeHandleProps,
    gridTemplateColumns,
    resetColumnWidth,
  };
}

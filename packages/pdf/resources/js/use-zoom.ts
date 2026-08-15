import { useEffect, useState } from "react";
import type { RefObject } from "react";

const MIN_SCALE = 0.25;
const MAX_SCALE = 4;
const ZOOM_FACTOR = 1.25;
const PAGE_GUTTER_PX = 32;

export type ZoomState = {
  scale: number | null;
  percent: number | null;
  isFitWidth: boolean;
  canZoomIn: boolean;
  canZoomOut: boolean;
  zoomIn(): void;
  zoomOut(): void;
  fitWidth(): void;
};

function clamp(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

export function useZoom(options: {
  containerRef: RefObject<HTMLElement | null>;
  baseWidth: number | null;
  initialZoom: number | null;
}): ZoomState {
  const [mode, setMode] = useState<number | "fit-width">(options.initialZoom ?? "fit-width");
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  useEffect(() => {
    const container = options.containerRef.current;

    if (!container) {
      return;
    }

    setContainerWidth(container.clientWidth);

    const observer = new ResizeObserver(() => {
      setContainerWidth(container.clientWidth);
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [options.containerRef]);

  const fitScale =
    containerWidth !== null && options.baseWidth !== null && options.baseWidth > 0
      ? clamp((containerWidth - PAGE_GUTTER_PX) / options.baseWidth)
      : null;
  const scale = mode === "fit-width" ? fitScale : mode;

  return {
    scale,
    percent: scale === null ? null : Math.round(scale * 100),
    isFitWidth: mode === "fit-width",
    canZoomIn: scale === null || scale < MAX_SCALE,
    canZoomOut: scale === null || scale > MIN_SCALE,
    zoomIn() {
      setMode(clamp((scale ?? 1) * ZOOM_FACTOR));
    },
    zoomOut() {
      setMode(clamp((scale ?? 1) / ZOOM_FACTOR));
    },
    fitWidth() {
      setMode("fit-width");
    },
  };
}

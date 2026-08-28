import { RefObject } from 'react';
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
export declare function useZoom(options: {
    containerRef: RefObject<HTMLElement | null>;
    baseWidth: number | null;
    initialZoom: number | null;
}): ZoomState;

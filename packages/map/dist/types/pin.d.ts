import { Node } from "@lattice-php/core";
import { MarkerData, RouteData } from "./types";
export type PopupPortal = {
  host: HTMLElement;
  id: string;
  schema: Node[];
  update: () => void;
};
export type MarkerIcon = {
  host: HTMLElement;
  icon: string;
  id: string;
};
export declare function PopupSchema({
  portal,
}: {
  portal: PopupPortal;
}): import("react").JSX.Element;
export declare function isMarkerFeature(feature: MarkerData | RouteData): feature is MarkerData;
export declare function isRouteFeature(feature: MarkerData | RouteData): feature is RouteData;
export declare function markerPinHtml(feature: MarkerData): string;
export declare function applyTone(
  element: HTMLElement | SVGElement | null,
  color: MarkerData["color"],
): void;
export declare function styleMarkerPin(
  element: HTMLElement | undefined,
  feature: MarkerData,
): HTMLElement | null;

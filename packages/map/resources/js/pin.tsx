import { useLayoutEffect } from "react";
import type { Node } from "@lattice-php/core";
import { Renderer } from "@lattice-php/core";
import { coerceColor, toneProps } from "@lattice-php/ui/lib/color";
import type { MarkerData, RouteData } from "./types";

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

export function PopupSchema({ portal }: { portal: PopupPortal }) {
  useLayoutEffect(() => {
    portal.update();

    const resizeObserver = new ResizeObserver(() => portal.update());
    resizeObserver.observe(portal.host);

    return () => resizeObserver.disconnect();
  }, [portal]);

  return <Renderer nodes={portal.schema} />;
}

export function isMarkerFeature(feature: MarkerData | RouteData): feature is MarkerData {
  return feature.type === "marker";
}

export function isRouteFeature(feature: MarkerData | RouteData): feature is RouteData {
  return feature.type === "route";
}

export function markerPinHtml(feature: MarkerData): string {
  const pinClass = feature.icon
    ? "lt-map-marker__pin lt-map-marker__pin--icon"
    : "lt-map-marker__pin";

  return `<span class="${pinClass}" aria-hidden="true"></span>`;
}

export function applyTone(
  element: HTMLElement | SVGElement | null,
  color: MarkerData["color"],
): void {
  const coerced = coerceColor(color);

  if (!element || !coerced) {
    return;
  }

  const tone = toneProps(coerced);

  if (tone.className) {
    element.classList.add(...tone.className.split(" "));
  }

  for (const [property, value] of Object.entries(tone.style ?? {})) {
    element.style.setProperty(property, String(value));
  }
}

export function styleMarkerPin(
  element: HTMLElement | undefined,
  feature: MarkerData,
): HTMLElement | null {
  const pin = element?.querySelector<HTMLElement>(".lt-map-marker__pin") ?? null;

  applyTone(pin, feature.color);

  return pin;
}

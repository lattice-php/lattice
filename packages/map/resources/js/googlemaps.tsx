import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useT } from "@lattice-php/ui/i18n";
import { IconRenderer } from "@lattice-php/ui/icons";
import { coerceColor, colorValue } from "@lattice-php/ui/lib/color";
import type { GoogleMapsLibraries } from "./googlemaps-loader";
import { loadGoogleMaps } from "./googlemaps-loader";
import type { MarkerIcon, PopupPortal } from "./pin";
import { isRouteFeature, markerPinHtml, PopupSchema, styleMarkerPin } from "./pin";
import type { MapProviderProps } from "./provider-registry";
import type { MarkerData, RouteData } from "./types";

type GoogleMapsOptions = {
  apiKey: string;
  mapId: string;
};

function providerOptions(options: Record<string, unknown>): GoogleMapsOptions {
  if (typeof options.apiKey !== "string" || typeof options.mapId !== "string") {
    throw new TypeError("Google Maps provider options require apiKey and mapId strings.");
  }

  return {
    apiKey: options.apiKey,
    mapId: options.mapId,
  };
}

function featurePositions(node: MapProviderProps["node"]): google.maps.LatLngLiteral[] {
  return node.props.features.flatMap((feature) =>
    isRouteFeature(feature)
      ? feature.path.map((point) => ({ lat: point.latitude, lng: point.longitude }))
      : [{ lat: feature.position.latitude, lng: feature.position.longitude }],
  );
}

function setInitialView(
  libraries: GoogleMapsLibraries,
  map: google.maps.Map,
  node: MapProviderProps["node"],
): void {
  const positions = featurePositions(node);

  if (node.props.center) {
    map.setCenter({ lat: node.props.center.latitude, lng: node.props.center.longitude });
    map.setZoom(node.props.zoom ?? 13);
    return;
  }

  if (positions.length === 1) {
    map.setCenter(positions[0]);
    map.setZoom(node.props.zoom ?? 13);
    return;
  }

  if (positions.length > 1) {
    const bounds = new libraries.core.LatLngBounds();

    for (const position of positions) {
      bounds.extend(position);
    }

    if (node.props.zoom !== null) {
      map.setCenter(bounds.getCenter());
      map.setZoom(node.props.zoom);
    } else {
      // fitBounds resolves asynchronously, so the zoom clamp can only be
      // lifted once the map settles on its first idle event.
      map.setOptions({ maxZoom: 15 });
      map.fitBounds(bounds, 32);
      const listener = map.addListener("idle", () => {
        listener.remove();
        map.setOptions({ maxZoom: node.props.provider.maximumZoom });
      });
    }

    return;
  }

  map.setCenter({ lat: 0, lng: 0 });
  map.setZoom(node.props.zoom ?? 2);
}

function addResetControl(
  libraries: GoogleMapsLibraries,
  map: google.maps.Map,
  label: string,
  setHost: (host: HTMLElement) => void,
): void {
  const initialCenter = map.getCenter();
  const initialZoom = map.getZoom();
  const container = document.createElement("div");
  const button = document.createElement("button");

  container.className = "lt-map__reset";
  button.type = "button";
  button.className = "lt-map__reset-button";
  button.title = label;
  button.setAttribute("aria-label", label);
  button.addEventListener("click", () => {
    if (initialCenter) {
      map.setCenter(initialCenter);
    }

    if (initialZoom !== undefined) {
      map.setZoom(initialZoom);
    }
  });
  container.append(button);
  map.controls[libraries.core.ControlPosition.TOP_LEFT].push(container);
  setHost(button);
}

function resolveStrokeColor(container: HTMLElement, color: RouteData["color"]): string {
  const coerced = coerceColor(color);
  const probe = document.createElement("span");

  probe.style.display = "none";
  probe.style.color = coerced ? colorValue(coerced) : "var(--lt-primary)";
  container.append(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();

  return resolved;
}

function addRoute(
  libraries: GoogleMapsLibraries,
  map: google.maps.Map,
  container: HTMLElement,
  feature: RouteData,
): void {
  new libraries.maps.Polyline({
    map,
    path: feature.path.map((point) => ({ lat: point.latitude, lng: point.longitude })),
    strokeColor: resolveStrokeColor(container, feature.color),
    strokeWeight: feature.weight ?? 3,
  });
}

function addMarker(
  libraries: GoogleMapsLibraries,
  map: google.maps.Map,
  feature: MarkerData,
  openMarker: (open: () => void) => void,
  onOpen: (infoWindow: google.maps.InfoWindow) => void,
  setPopup: (portal: PopupPortal | null) => void,
  addIcon: (markerIcon: MarkerIcon) => void,
): void {
  const content = document.createElement("div");

  content.className = "lt-map-marker";
  content.innerHTML = markerPinHtml(feature);
  const pin = styleMarkerPin(content, feature);

  if (pin && feature.icon) {
    addIcon({ host: pin, icon: feature.icon, id: feature.id });
  }

  const marker = new libraries.marker.AdvancedMarkerElement({
    map,
    content,
    gmpClickable: feature.schema.length > 0,
    position: { lat: feature.position.latitude, lng: feature.position.longitude },
    title: feature.label,
  });

  if (feature.schema.length === 0) {
    return;
  }

  const host = document.createElement("div");

  host.className = "lt-map-popup__content";
  const infoWindow = new libraries.maps.InfoWindow({ content: host, maxWidth: 360 });
  const open = () => {
    infoWindow.open({ anchor: marker, map });
    onOpen(infoWindow);
    setPopup({
      host,
      id: feature.id,
      schema: feature.schema,
      update: () => {},
    });
  };

  infoWindow.addListener("closeclick", () => setPopup(null));
  marker.addEventListener("gmp-click", open);

  if (feature.open) {
    openMarker(open);
  }
}

export default function GoogleMaps({ node }: MapProviderProps) {
  const { t } = useT("map");
  const container = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [popup, setPopup] = useState<PopupPortal | null>(null);
  const [markerIcons, setMarkerIcons] = useState<MarkerIcon[]>([]);
  const [resetHost, setResetHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const element = container.current;

    if (!element) {
      return;
    }

    let disposed = false;
    let map: google.maps.Map | null = null;
    let openInfoWindow: google.maps.InfoWindow | null = null;
    let markerToOpen: (() => void) | null = null;

    setStatus("loading");
    setPopup(null);
    setMarkerIcons([]);
    setResetHost(null);

    Promise.resolve()
      .then(() => providerOptions(node.props.provider.options))
      .then(async (options) => ({ libraries: await loadGoogleMaps(options.apiKey), options }))
      .then(({ libraries, options }) => {
        if (disposed) {
          return;
        }

        map = new libraries.maps.Map(element, {
          disableDefaultUI: true,
          gestureHandling: node.props.scrollZoom ? "greedy" : "cooperative",
          mapId: options.mapId,
          maxZoom: node.props.provider.maximumZoom,
          minZoom: node.props.provider.minimumZoom,
          zoomControl: node.props.navigationControls,
        });

        setInitialView(libraries, map, node);

        if (node.props.zoom !== null && node.props.navigationControls) {
          addResetControl(libraries, map, t("map.reset-view", "Reset view"), setResetHost);
        }

        const icons: MarkerIcon[] = [];

        for (const feature of node.props.features) {
          if (isRouteFeature(feature)) {
            addRoute(libraries, map, element, feature);
            continue;
          }

          addMarker(
            libraries,
            map,
            feature,
            (open) => {
              markerToOpen = open;
            },
            (infoWindow) => {
              if (openInfoWindow && openInfoWindow !== infoWindow) {
                openInfoWindow.close();
              }

              openInfoWindow = infoWindow;
            },
            setPopup,
            (markerIcon) => icons.push(markerIcon),
          );
        }

        setMarkerIcons(icons);
        markerToOpen?.();
        setStatus("ready");
      })
      .catch((error: unknown) => {
        console.error("[lattice/map] Google Maps failed to load.", error);

        if (!disposed) {
          setStatus("error");
        }
      });

    return () => {
      disposed = true;
      map = null;
      element.replaceChildren();
    };
  }, [node, t]);

  return (
    <div
      className="lt-map"
      data-test={node.id}
      data-status={status}
      style={{ height: node.props.height }}
    >
      <div
        aria-label={t("map.label", "Map")}
        className="lt-map__canvas"
        ref={container}
        role="region"
      />
      {status === "loading" && (
        <div className="lt-map__message" role="status">
          {t("map.loading", "Loading map…")}
        </div>
      )}
      {status === "error" && (
        <div className="lt-map__message lt-map__message--error" role="alert">
          {t("map.error", "The map could not be loaded.")}
        </div>
      )}
      {popup && createPortal(<PopupSchema portal={popup} />, popup.host, popup.id)}
      {resetHost && createPortal(<IconRenderer icon="rotate-ccw" />, resetHost, "reset-view")}
      {markerIcons.map((markerIcon) =>
        createPortal(
          <IconRenderer icon={markerIcon.icon} />,
          markerIcon.host,
          `marker-icon-${markerIcon.id}`,
        ),
      )}
    </div>
  );
}

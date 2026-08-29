import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useT } from "@lattice-php/ui/i18n";
import { IconRenderer } from "@lattice-php/ui/icons";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import type { MarkerIcon, PopupPortal } from "./pin";
import { applyTone, isRouteFeature, markerPinHtml, PopupSchema, styleMarkerPin } from "./pin";
import type { MapProviderProps } from "./provider-registry";
import type { MarkerData, RouteData } from "./types";

type OpenStreetMapOptions = {
  attribution: string;
  tileUrl: string;
};

function providerOptions(options: Record<string, unknown>): OpenStreetMapOptions {
  if (typeof options.attribution !== "string" || typeof options.tileUrl !== "string") {
    throw new TypeError("OpenStreetMap provider options require tileUrl and attribution strings.");
  }

  return {
    attribution: options.attribution,
    tileUrl: options.tileUrl,
  };
}

function setInitialView(
  leaflet: typeof import("leaflet"),
  map: LeafletMap,
  node: MapProviderProps["node"],
): void {
  const positions = node.props.features.flatMap((feature) =>
    isRouteFeature(feature)
      ? feature.path.map((point) => [point.latitude, point.longitude] as [number, number])
      : [[feature.position.latitude, feature.position.longitude] as [number, number]],
  );

  if (node.props.center) {
    map.setView([node.props.center.latitude, node.props.center.longitude], node.props.zoom ?? 13);
    return;
  }

  if (positions.length === 1) {
    map.setView(positions[0], node.props.zoom ?? 13);
    return;
  }

  if (positions.length > 1) {
    const bounds = leaflet.latLngBounds(positions);

    if (node.props.zoom !== null) {
      map.setView(bounds.getCenter(), node.props.zoom);
    } else {
      map.fitBounds(bounds, { maxZoom: 15, padding: [32, 32] });
    }

    return;
  }

  map.setView([0, 0], node.props.zoom ?? 2);
}

function addResetControl(
  leaflet: typeof import("leaflet"),
  map: LeafletMap,
  label: string,
  setHost: (host: HTMLElement) => void,
): void {
  const initialCenter = map.getCenter();
  const initialZoom = map.getZoom();
  const control = new leaflet.Control({ position: "topleft" });

  control.onAdd = () => {
    const container = leaflet.DomUtil.create("div", "lt-map__reset");
    const button = document.createElement("button");

    button.type = "button";
    button.className = "lt-map__reset-button";
    button.title = label;
    button.setAttribute("aria-label", label);
    container.append(button);
    leaflet.DomEvent.disableClickPropagation(container);
    // animate: false keeps Leaflet from scheduling its 250ms zoom-animation
    // fallback timer, which would throw if the map unmounts before it fires.
    leaflet.DomEvent.on(button, "click", () =>
      map.setView(initialCenter, initialZoom, { animate: false }),
    );
    setHost(button);

    return container;
  };

  control.addTo(map);
}

function addRoute(leaflet: typeof import("leaflet"), map: LeafletMap, feature: RouteData): void {
  const polyline = leaflet.polyline(
    feature.path.map((point) => [point.latitude, point.longitude] as [number, number]),
    { className: "lt-map-route", weight: feature.weight ?? 3 },
  );

  polyline.addTo(map);
  applyTone((polyline.getElement() as SVGElement | undefined) ?? null, feature.color);
}

function addMarker(
  leaflet: typeof import("leaflet"),
  map: LeafletMap,
  feature: MarkerData,
  closePopupLabel: () => string,
  openMarker: (marker: LeafletMarker) => void,
  setPopup: (portal: PopupPortal | null) => void,
  addIcon: (markerIcon: MarkerIcon) => void,
): void {
  const icon = leaflet.divIcon({
    className: "lt-map-marker",
    html: markerPinHtml(feature),
    iconAnchor: [14, 36],
    iconSize: [28, 36],
    popupAnchor: [0, -34],
  });
  const marker = leaflet.marker([feature.position.latitude, feature.position.longitude], {
    alt: feature.label,
    icon,
    keyboard: true,
    riseOnHover: true,
    title: feature.label,
  });

  marker.addTo(map);
  const element = marker.getElement();
  element?.setAttribute("aria-label", feature.label);
  const pin = styleMarkerPin(element, feature);

  if (pin && feature.icon) {
    addIcon({ host: pin, icon: feature.icon, id: feature.id });
  }

  if (feature.schema.length > 0) {
    const host = document.createElement("div");
    host.className = "lt-map-popup__content";
    marker.bindPopup(host, { closeButton: true, maxWidth: 360, minWidth: 180 });
    marker.on("popupopen", () => {
      const popup = marker.getPopup();
      const label = closePopupLabel();
      const closeButton = popup
        ?.getElement()
        ?.querySelector<HTMLElement>(".leaflet-popup-close-button");

      closeButton?.setAttribute("aria-label", label);
      closeButton?.setAttribute("title", label);
      setPopup({
        host,
        id: feature.id,
        schema: feature.schema,
        update: () => popup?.update(),
      });
    });
    marker.on("popupclose", () => setPopup(null));
  }

  if (feature.open) {
    openMarker(marker);
  }
}

export default function OpenStreetMap({ node }: MapProviderProps) {
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
    let map: LeafletMap | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let resizeFrame: number | null = null;
    let observedWidth = element.clientWidth;
    let observedHeight = element.clientHeight;
    let markerToOpen: LeafletMarker | null = null;
    let cooperativeWheel: ((event: WheelEvent) => void) | null = null;

    setStatus("loading");
    setPopup(null);
    setMarkerIcons([]);
    setResetHost(null);

    void import("leaflet")
      .then((leaflet) => {
        if (disposed) {
          return;
        }

        const options = providerOptions(node.props.provider.options);
        map = leaflet.map(element, {
          attributionControl: true,
          scrollWheelZoom: node.props.scrollZoom,
          zoomControl: node.props.navigationControls,
        });

        leaflet
          .tileLayer(options.tileUrl, {
            attribution: options.attribution,
            maxZoom: node.props.provider.maximumZoom,
            minZoom: node.props.provider.minimumZoom,
          })
          .addTo(map);

        if (!node.props.scrollZoom) {
          // Cooperative gestures: plain scrolling keeps scrolling the page,
          // but Cmd/Ctrl+wheel (and trackpad pinch, which browsers report as
          // ctrl+wheel) zooms the map by toggling Leaflet's own handler.
          cooperativeWheel = (event) => {
            const wheelZoom = map?.scrollWheelZoom;

            if (event.metaKey || event.ctrlKey) {
              wheelZoom?.enable();
            } else {
              wheelZoom?.disable();
            }
          };
          element.addEventListener("wheel", cooperativeWheel, { capture: true, passive: true });
        }

        // Layers only initialize their DOM elements once the map has a view,
        // so the view must be set before markers are added and styled.
        setInitialView(leaflet, map, node);

        if (node.props.zoom !== null && node.props.navigationControls) {
          addResetControl(leaflet, map, t("map.reset-view", "Reset view"), setResetHost);
        }

        const icons: MarkerIcon[] = [];

        for (const feature of node.props.features) {
          if (isRouteFeature(feature)) {
            addRoute(leaflet, map, feature);
            continue;
          }

          addMarker(
            leaflet,
            map,
            feature,
            () => t("map.close-popup", "Close popup"),
            (marker) => {
              markerToOpen = marker;
            },
            setPopup,
            (markerIcon) => icons.push(markerIcon),
          );
        }

        setMarkerIcons(icons);
        markerToOpen?.openPopup();
        resizeObserver = new ResizeObserver(([entry]) => {
          const { height, width } = entry.contentRect;

          if (width === observedWidth && height === observedHeight) {
            return;
          }

          observedWidth = width;
          observedHeight = height;

          if (resizeFrame !== null) {
            return;
          }

          resizeFrame = requestAnimationFrame(() => {
            resizeFrame = null;
            map?.invalidateSize({ pan: false });
          });
        });
        resizeObserver.observe(element);
        setStatus("ready");
      })
      .catch(() => {
        if (!disposed) {
          setStatus("error");
        }
      });

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      if (resizeFrame !== null) {
        cancelAnimationFrame(resizeFrame);
      }
      if (cooperativeWheel) {
        element.removeEventListener("wheel", cooperativeWheel, { capture: true });
      }
      map?.remove();
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

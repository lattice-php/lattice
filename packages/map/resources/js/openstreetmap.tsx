import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Node } from "@lattice-php/core";
import { Renderer } from "@lattice-php/core";
import { useT } from "@lattice-php/ui/i18n";
import { IconRenderer } from "@lattice-php/ui/icons";
import { coerceColor, toneProps } from "@lattice-php/ui/lib/color";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import type { MapProviderProps } from "./provider-registry";
import type { MarkerData } from "./types";

type OpenStreetMapOptions = {
  attribution: string;
  tileUrl: string;
};

type PopupPortal = {
  host: HTMLElement;
  id: string;
  schema: Node[];
  update: () => void;
};

type MarkerIcon = {
  host: HTMLElement;
  icon: string;
  id: string;
};

function PopupSchema({ portal }: { portal: PopupPortal }) {
  useLayoutEffect(() => {
    portal.update();

    const resizeObserver = new ResizeObserver(() => portal.update());
    resizeObserver.observe(portal.host);

    return () => resizeObserver.disconnect();
  }, [portal]);

  return <Renderer nodes={portal.schema} />;
}

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
  const positions = node.props.features.map(
    (feature) => [feature.position.latitude, feature.position.longitude] as [number, number],
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

function styleMarkerPin(element: HTMLElement | undefined, feature: MarkerData): HTMLElement | null {
  const pin = element?.querySelector<HTMLElement>(".lt-map-marker__pin") ?? null;
  const color = coerceColor(feature.color);

  if (pin && color) {
    const tone = toneProps(color);

    if (tone.className) {
      pin.classList.add(...tone.className.split(" "));
    }

    for (const [property, value] of Object.entries(tone.style ?? {})) {
      pin.style.setProperty(property, String(value));
    }
  }

  return pin;
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
  const pinClass = feature.icon
    ? "lt-map-marker__pin lt-map-marker__pin--icon"
    : "lt-map-marker__pin";
  const icon = leaflet.divIcon({
    className: "lt-map-marker",
    html: `<span class="${pinClass}" aria-hidden="true"></span>`,
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

        const icons: MarkerIcon[] = [];

        for (const feature of node.props.features) {
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
      data-lattice-component={node.id}
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

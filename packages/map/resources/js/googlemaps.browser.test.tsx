import { page, userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it } from "vitest";
import { createRegistry, eagerComponent, Renderer } from "@lattice-php/core";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { fakeNode, TextProbe } from "@lattice-php/core/test-support";
import type { Plugin } from "@lattice-php/core";
import mapPlugin from "./plugin";
import distPlugin from "../../dist/plugin.js";
import type { MapWireProps, MarkerData, RouteData } from "./types";
import "../css/map.css";

const registry = createRegistry(mapPlugin, {
  components: {
    text: eagerComponent(TextProbe),
  },
  name: "test/map-content",
});

const distRegistry = createRegistry(distPlugin as Plugin, {
  components: {
    text: eagerComponent(TextProbe),
  },
  name: "test/map-content",
});

type PolylineOptions = {
  map: FakeMap;
  path: { lat: number; lng: number }[];
  strokeColor: string;
  strokeWeight: number;
};

class FakeMap {
  element: HTMLElement;
  options: Record<string, unknown>;
  controls: Record<number, { push: (control: HTMLElement) => void }>;

  constructor(element: HTMLElement, options: Record<string, unknown>) {
    this.element = element;
    this.options = options;
    this.controls = {
      1: { push: (control) => this.element.append(control) },
    };
  }

  setCenter(): void {}
  setZoom(): void {}
  getCenter(): unknown {
    return {};
  }
  getZoom(): number {
    return 13;
  }
  setOptions(): void {}
  fitBounds(): void {}
  addListener(): { remove: () => void } {
    return { remove: () => {} };
  }
}

class FakeInfoWindow {
  host: HTMLElement;

  constructor(options: { content: HTMLElement }) {
    this.host = options.content;
  }

  open(options: { anchor: { map: FakeMap } }): void {
    options.anchor.map.element.append(this.host);
  }

  close(): void {
    this.host.remove();
  }

  addListener(): void {}
}

class FakeAdvancedMarker {
  static created: FakeAdvancedMarker[] = [];

  map: FakeMap;
  content: HTMLElement;

  constructor(options: { map: FakeMap; content: HTMLElement; title: string }) {
    this.map = options.map;
    this.content = options.content;
    this.content.setAttribute("role", "button");
    this.content.setAttribute("aria-label", options.title);
    this.map.element.append(this.content);
    FakeAdvancedMarker.created.push(this);
  }

  addEventListener(event: string, callback: () => void): void {
    if (event === "gmp-click") {
      this.content.addEventListener("click", callback);
    }
  }
}

class FakePolyline {
  static created: PolylineOptions[] = [];

  constructor(options: PolylineOptions) {
    FakePolyline.created.push(options);
  }
}

class FakeLatLngBounds {
  extend(): void {}
  getCenter(): unknown {
    return {};
  }
}

beforeEach(() => {
  FakeAdvancedMarker.created = [];
  FakePolyline.created = [];
  window.google = {
    maps: {
      importLibrary: (name: string) => {
        const libraries: Record<string, unknown> = {
          core: { ControlPosition: { TOP_LEFT: 1 }, LatLngBounds: FakeLatLngBounds },
          maps: { InfoWindow: FakeInfoWindow, Map: FakeMap, Polyline: FakePolyline },
          marker: { AdvancedMarkerElement: FakeAdvancedMarker },
        };

        return Promise.resolve(libraries[name]);
      },
    },
  } as unknown as typeof google;
});

afterEach(() => {
  Reflect.deleteProperty(window, "google");
});

function marker(
  id: string,
  label: string,
  latitude: number,
  longitude: number,
  extra: Partial<MarkerData> = {},
): MarkerData {
  return {
    color: null,
    icon: null,
    id,
    label,
    open: id === "berlin",
    position: { latitude, longitude },
    schema: [{ props: { text: `${label} content` }, type: "text" }],
    type: "marker",
    ...extra,
  };
}

async function renderMap(extra: Partial<MapWireProps> = {}, into = registry) {
  const node = fakeNode({
    id: "office-map",
    type: "map",
    props: {
      center: null,
      features: [
        marker("berlin", "Berlin office", 52.52, 13.405),
        marker("hamburg", "Hamburg office", 53.5511, 9.9937),
      ],
      height: 420,
      navigationControls: true,
      provider: {
        maximumZoom: 22,
        minimumZoom: 0,
        name: "googlemaps",
        options: { apiKey: "test-key", mapId: "DEMO_MAP_ID" },
      },
      scrollZoom: false,
      zoom: null,
      ...extra,
    },
  });

  return renderWithRegistry(<Renderer nodes={[node]} />, into);
}

it("opens server-selected popup content and switches it through a real marker click", async () => {
  await renderMap();

  await expect.element(page.getByText("Berlin office content")).toBeVisible();

  await userEvent.click(page.getByRole("button", { name: "Hamburg office" }));

  await expect.element(page.getByText("Hamburg office content")).toBeVisible();
  await expect.element(page.getByText("Berlin office content")).not.toBeInTheDocument();
});

it("renders a per-marker icon inside a toned pin", async () => {
  await renderMap({
    features: [
      marker("munich", "Munich office", 48.1372, 11.5756, {
        color: { dark: null, kind: "named", value: "warning" },
        icon: "bell",
      }),
    ],
  });

  await expect
    .poll(() => document.querySelector(".lt-map-marker__pin--icon use")?.getAttribute("href"))
    .toContain("bell");
  await expect
    .poll(() =>
      document.querySelector(".lt-map-marker__pin")?.classList.contains("lt-tone-warning"),
    )
    .toBe(true);

  await userEvent.click(page.getByRole("button", { name: "Munich office" }));

  await expect.element(page.getByText("Munich office content")).toBeVisible();
});

it("draws routes with the tone resolved to a concrete stroke color", async () => {
  document.documentElement.style.setProperty("--lt-color-info", "rgb(10, 120, 230)");

  const route: RouteData = {
    color: { dark: null, kind: "named", value: "info" },
    id: "commute",
    path: [
      { latitude: 52.52, longitude: 13.405 },
      { latitude: 52.39, longitude: 13.06 },
    ],
    type: "route",
    weight: 5,
  };

  await renderMap({ features: [route] });

  await expect.poll(() => FakePolyline.created.length).toBe(1);

  expect(FakePolyline.created[0].strokeColor).toBe("rgb(10, 120, 230)");
  expect(FakePolyline.created[0].strokeWeight).toBe(5);
  expect(FakePolyline.created[0].path).toEqual([
    { lat: 52.52, lng: 13.405 },
    { lat: 52.39, lng: 13.06 },
  ]);

  document.documentElement.style.removeProperty("--lt-color-info");
});

it("serves markers, popups, and routes through the standalone artifact's renderer", async () => {
  const route: RouteData = {
    color: { dark: null, kind: "named", value: "info" },
    id: "commute",
    path: [
      { latitude: 52.52, longitude: 13.405 },
      { latitude: 52.39, longitude: 13.06 },
    ],
    type: "route",
    weight: 4,
  };

  await renderMap(
    { features: [route, marker("berlin", "Berlin office", 52.52, 13.405)] },
    distRegistry,
  );

  await expect.element(page.getByText("Berlin office content")).toBeVisible();
  await expect.poll(() => FakePolyline.created.length).toBe(1);
});

it("reports invalid provider configuration without leaving the map pending", async () => {
  await renderMap({
    provider: {
      maximumZoom: 22,
      minimumZoom: 0,
      name: "googlemaps",
      options: {},
    },
  });

  await expect.element(page.getByRole("alert")).toHaveTextContent("The map could not be loaded.");
});

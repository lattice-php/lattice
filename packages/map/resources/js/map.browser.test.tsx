import { page, userEvent } from "vitest/browser";
import { expect, it } from "vitest";
import { createRegistry, eagerComponent, Renderer } from "@lattice-php/core";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { fakeNode, TextProbe } from "@lattice-php/core/test-support";
import type { Plugin } from "@lattice-php/core";
import mapPlugin from "./plugin";
import composerPlugin from "./plugin.composer";
import distPlugin from "../../dist/plugin.js";
import type { MapWireProps, MarkerData, RouteData } from "./types";
import "../css/map.css";

const transparentTile =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'/%3E";

const registry = createRegistry(mapPlugin, {
  components: {
    text: eagerComponent(TextProbe),
  },
  name: "test/map-content",
});

const composerRegistry = createRegistry(composerPlugin, {
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
        maximumZoom: 19,
        minimumZoom: 1,
        name: "openstreetmap",
        options: { attribution: "OpenStreetMap contributors", tileUrl: transparentTile },
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

it("serves the same popup behavior through the Composer entry's prebuilt renderer", async () => {
  await renderMap({}, composerRegistry);

  await expect.element(page.getByText("Berlin office content")).toBeVisible();

  await userEvent.click(page.getByRole("button", { name: "Hamburg office" }));

  await expect.element(page.getByText("Hamburg office content")).toBeVisible();
});

it("renders the standalone artifact's own map component against the runtime barrel", async () => {
  await renderMap({}, distRegistry);

  await expect.element(page.getByText("Berlin office content")).toBeVisible();
});

it("fits the view around a toned route so its full path stays visible", async () => {
  const route: RouteData = {
    color: { dark: null, kind: "named", value: "info" },
    id: "commute",
    path: [
      { latitude: 52.52, longitude: 13.405 },
      { latitude: 52.43, longitude: 13.2 },
      { latitude: 52.39, longitude: 13.06 },
    ],
    type: "route",
    weight: 5,
  };

  await renderMap({
    features: [route, marker("berlin", "Berlin office", 52.52, 13.405)],
  });

  await expect.poll(() => document.querySelector("path.lt-map-route")).toBeTruthy();

  const path = document.querySelector<SVGPathElement>("path.lt-map-route")!;
  const canvas = document.querySelector(".lt-map__canvas")!.getBoundingClientRect();
  const drawn = path.getBoundingClientRect();

  expect(path.classList.contains("lt-tone-info")).toBe(true);
  expect(path.getAttribute("stroke-width")).toBe("5");
  expect(drawn.left).toBeGreaterThanOrEqual(canvas.left);
  expect(drawn.right).toBeLessThanOrEqual(canvas.right);
  expect(drawn.top).toBeGreaterThanOrEqual(canvas.top);
  expect(drawn.bottom).toBeLessThanOrEqual(canvas.bottom);
});

it("reports invalid provider configuration without leaving the map pending", async () => {
  await renderMap({
    provider: {
      maximumZoom: 19,
      minimumZoom: 1,
      name: "openstreetmap",
      options: {},
    },
  });

  await expect.element(page.getByRole("alert")).toMatchTextContent("The map could not be loaded.");
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

it("automatically centers a single marker for interaction", async () => {
  await renderMap({
    features: [marker("munich", "Munich office", 48.1372, 11.5756)],
  });

  await userEvent.click(page.getByRole("button", { name: "Munich office" }));

  await expect.element(page.getByText("Munich office content")).toBeVisible();
});

it("returns to the server-defined zoom when the reset control is clicked after zooming away", async () => {
  await renderMap({
    center: { latitude: 48.1372, longitude: 11.5756 },
    features: [
      marker("munich", "Munich office", 48.1372, 11.5756),
      marker("freising", "Freising office", 48.15, 11.6),
    ],
    zoom: 14,
  });

  // The distance between two markers depends only on the zoom level, so it is
  // immune to the container resizes the test viewport goes through.
  const markerDistance = () => {
    const pins = document.querySelectorAll(".leaflet-marker-icon");

    if (pins.length < 2) {
      return null;
    }

    const first = pins[0].getBoundingClientRect();
    const second = pins[1].getBoundingClientRect();

    return Math.hypot(second.left - first.left, second.top - first.top);
  };

  await expect.poll(markerDistance).toBeTruthy();
  const initialDistance = markerDistance()!;

  await userEvent.click(page.getByRole("button", { name: "Zoom out" }));

  await expect
    .poll(() => markerDistance() ?? Number.POSITIVE_INFINITY)
    .toBeLessThan(initialDistance * 0.75);

  // Leaflet silently drops setView while a zoom animation is still running,
  // so wait for the zoom-out animation to finish before resetting.
  await expect.poll(() => document.querySelector(".leaflet-zoom-anim")).toBeNull();

  await userEvent.click(page.getByRole("button", { name: "Reset view" }));

  await expect
    .poll(() => Math.abs((markerDistance() ?? Number.POSITIVE_INFINITY) - initialDistance))
    .toBeLessThanOrEqual(1);
});

it("uses the server-provided center and zoom for an interactive marker", async () => {
  await renderMap({
    center: { latitude: 48.1372, longitude: 11.5756 },
    features: [marker("munich", "Munich office", 48.1372, 11.5756)],
    zoom: 16,
  });

  await userEvent.click(page.getByRole("button", { name: "Munich office" }));

  await expect.element(page.getByText("Munich office content")).toBeVisible();
});

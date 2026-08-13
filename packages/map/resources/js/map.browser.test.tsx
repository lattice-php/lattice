import { page, userEvent } from "vitest/browser";
import { expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { fakeNode, TextProbe } from "@lattice-php/core/test-support";
import MapComponent from "./map";
import OpenStreetMap from "./openstreetmap";
import type { MapWireProps, MarkerData } from "./types";
import "../css/map.css";

const transparentTile =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'/%3E";

const registry = createRegistry({
  components: {
    text: eagerComponent(TextProbe),
  },
  extensions: {
    "map.providers": {
      openstreetmap: OpenStreetMap,
    },
  },
  name: "test/map",
});

function marker(id: string, label: string, latitude: number, longitude: number): MarkerData {
  return {
    id,
    label,
    open: id === "berlin",
    position: { latitude, longitude },
    schema: [{ props: { text: `${label} content` }, type: "text" }],
    type: "marker",
  };
}

async function renderMap(extra: Partial<MapWireProps> = {}) {
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

  return renderWithRegistry(<MapComponent node={node}>{null}</MapComponent>, registry);
}

it("opens server-selected popup content and switches it through a real marker click", async () => {
  await renderMap();

  await expect.element(page.getByText("Berlin office content")).toBeVisible();

  await userEvent.click(page.getByRole("button", { name: "Hamburg office" }));

  await expect.element(page.getByText("Hamburg office content")).toBeVisible();
  await expect.element(page.getByText("Berlin office content")).not.toBeInTheDocument();
});

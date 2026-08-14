import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createRegistry, eagerComponent, Renderer } from "@lattice-php/core";
import { fakeNode, renderWithRegistry } from "@lattice-php/core/test-support";
import MapComponent from "./map";

const registry = createRegistry({
  components: { map: eagerComponent(MapComponent) },
  name: "test/map-missing-provider",
});

it("names an unavailable provider in its error state", () => {
  const node = fakeNode({
    id: "office-map",
    type: "map",
    props: {
      features: [],
      height: 400,
      provider: {
        maximumZoom: 22,
        minimumZoom: 0,
        name: "google-maps",
        options: {},
      },
    },
  });

  renderWithRegistry(<Renderer nodes={[node]} />, registry);

  expect(screen.getByRole("alert")).toHaveTextContent(
    "Map provider “google-maps” is not available.",
  );
});

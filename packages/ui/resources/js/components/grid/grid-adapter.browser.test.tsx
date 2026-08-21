import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { TextProbe } from "@lattice-php/core/test-support";
import { GridAdapter } from "./grid-adapter";

const registry = createRegistry({
  components: {
    grid: eagerComponent(GridAdapter),
    text: eagerComponent(TextProbe),
  },
  name: "test/grid-adapter",
});

describe("Grid adapter in a browser", () => {
  it("maps a child column span into the client grid layout", async () => {
    const screen = await renderWithRegistry(
      <Renderer
        nodes={[
          {
            props: { columns: { default: 2 } },
            type: "grid",
            schema: [
              {
                props: { columnSpan: { default: "full" }, text: "Wide" },
                type: "text",
              },
              { props: { text: "Narrow" }, type: "text" },
            ],
          },
        ]}
      />,
      registry,
    );

    await expect.element(screen.getByText("Wide")).toBeVisible();

    const [wideItem, narrowItem] = Array.from(
      document.querySelector("[data-slot=grid]")!.children,
    ) as HTMLElement[];

    expect(wideItem.getBoundingClientRect().width).toBeGreaterThan(
      narrowItem.getBoundingClientRect().width,
    );
  });
});

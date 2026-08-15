import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import { renderWithRegistry, TextProbe } from "@lattice-php/core/test-support";
import GridComponent from "./grid";

const registry = createRegistry({
  components: {
    grid: eagerComponent(GridComponent),
    text: eagerComponent(TextProbe),
  },
  name: "test/grid",
});

describe("Grid in a browser", () => {
  it("does not leak a full column span into a nested grid", async () => {
    const screen = await renderWithRegistry(
      <Renderer
        nodes={[
          {
            id: "outer",
            props: { columns: { default: 2 } },
            type: "grid",
            schema: [
              {
                id: "inner",
                props: { columns: { default: 2 }, columnSpan: { default: "full" } },
                type: "grid",
                schema: [
                  { id: "a", props: { text: "Field A" }, type: "text" },
                  { id: "b", props: { text: "Field B" }, type: "text" },
                ],
              },
            ],
          },
        ]}
      />,
      registry,
    );

    await expect.element(screen.getByText("Field A")).toBeVisible();

    const innerGrid = document.querySelectorAll(".lt-grid")[1] as HTMLElement;
    const [itemA, itemB] = Array.from(innerGrid.children) as HTMLElement[];

    expect(getComputedStyle(itemA).gridColumn).toBe("auto");
    expect(getComputedStyle(itemB).gridColumn).toBe("auto");
    expect(itemB.getBoundingClientRect().x).toBeGreaterThan(itemA.getBoundingClientRect().x);
  });
});

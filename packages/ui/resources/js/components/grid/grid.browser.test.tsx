import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import { Grid, GridItem } from "./grid";

describe("Grid in a browser", () => {
  it("does not leak a full column span into a nested grid", async () => {
    const screen = await render(
      <Grid columns={{ default: 2 }}>
        <GridItem columnSpan={{ default: "full" }}>
          <Grid columns={{ default: 2 }}>
            <GridItem>Field A</GridItem>
            <GridItem>Field B</GridItem>
          </Grid>
        </GridItem>
      </Grid>,
    );

    await expect.element(screen.getByText("Field A")).toBeVisible();

    const innerGrid = document.querySelectorAll(".lt-grid")[1] as HTMLElement;
    const [itemA, itemB] = Array.from(innerGrid.children) as HTMLElement[];

    expect(getComputedStyle(itemA).gridColumn).toBe("auto");
    expect(getComputedStyle(itemB).gridColumn).toBe("auto");
    expect(itemB.getBoundingClientRect().x).toBeGreaterThan(itemA.getBoundingClientRect().x);
  });
});

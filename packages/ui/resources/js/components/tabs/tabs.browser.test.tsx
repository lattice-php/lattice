import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { afterEach, describe, expect, it } from "vitest";
import { Tab, Tabs } from "./tabs";

describe("Tabs in a browser", () => {
  afterEach(async () => page.viewport(1280, 800));

  it("uses the responsive select to switch lazily mounted vertical panels", async () => {
    await page.viewport(390, 800);
    const screen = await render(
      <Tabs defaultValue="overview" orientation="vertical">
        <Tab label={<span>Overview</span>} value="overview">
          Overview panel
        </Tab>
        <Tab label={<span>Details</span>} value="details">
          Details panel
        </Tab>
      </Tabs>,
    );

    const select = screen.getByRole("combobox", { name: "Tabs" });
    await expect.element(screen.getByText("Overview panel")).toBeVisible();

    await select.selectOptions("details");

    await expect.element(select).toHaveValue("details");
    await expect.element(screen.getByText("Details panel")).toBeVisible();
    await expect.element(screen.getByText("Overview panel")).not.toBeVisible();
  });
});

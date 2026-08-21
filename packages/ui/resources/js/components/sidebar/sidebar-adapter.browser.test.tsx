import { page } from "vitest/browser";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import { Renderer } from "@lattice-php/core/renderer";
import type { Node } from "@lattice-php/core/types";
import SidebarAdapter from "./sidebar-adapter";

const registry = createRegistry({
  components: { sidebar: eagerComponent(SidebarAdapter) },
  name: "test/sidebar",
});

const node: Node = {
  id: "app-sidebar",
  props: { collapsible: true, rememberState: false },
  type: "sidebar",
};

function dispatchToggle(): void {
  window.dispatchEvent(
    new CustomEvent(LATTICE_EVENT.toggleSidebar, { detail: { target: "app-sidebar" } }),
  );
}

describe("Sidebar in a browser", () => {
  beforeEach(async () => {
    await page.viewport(1280, 800);
  });

  afterEach(() => window.localStorage.clear());

  it("renders the expanded desktop rail and collapses it to the icon rail on toggle", async () => {
    const screen = await renderWithRegistry(<Renderer nodes={[node]} />, registry);
    const aside = screen.getByTestId("sidebar").element() as HTMLElement;

    expect(aside.getBoundingClientRect().width).toBe(256);

    dispatchToggle();

    await expect.element(screen.getByTestId("sidebar")).toHaveAttribute("data-collapsed", "true");
    await expect.poll(() => aside.getBoundingClientRect().width).toBe(64);

    dispatchToggle();

    await expect.poll(() => aside.getBoundingClientRect().width).toBe(256);
  });

  it("keeps the desktop rail off-screen below the md breakpoint until toggled open", async () => {
    await page.viewport(390, 800);

    const screen = await renderWithRegistry(<Renderer nodes={[node]} />, registry);
    const aside = screen.getByTestId("sidebar").element() as HTMLElement;

    expect(aside.getBoundingClientRect().right).toBeLessThanOrEqual(0);

    dispatchToggle();

    await expect.poll(() => aside.getBoundingClientRect().left).toBe(0);
    await expect.element(screen.getByTestId("sidebar-backdrop")).toBeInTheDocument();
  });
});

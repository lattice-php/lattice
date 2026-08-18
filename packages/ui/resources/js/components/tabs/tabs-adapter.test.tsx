import { fireEvent, screen } from "@testing-library/react";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import { renderWithRegistry, stubMatchMedia, TextProbe } from "@lattice-php/core/test-support";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultNavigation, NavigationProvider } from "../../navigation";
import TabAdapter, { TabsAdapter } from "./tabs-adapter";

const visit = vi.fn();

const registry = createRegistry({
  components: {
    tab: eagerComponent(TabAdapter),
    tabs: eagerComponent(TabsAdapter),
    text: eagerComponent(TextProbe),
  },
  name: "test/tabs-adapter",
});

function withNavigation(children: ReactNode) {
  return (
    <NavigationProvider adapter={{ ...defaultNavigation, visit }}>{children}</NavigationProvider>
  );
}

function tab(label: string, value: string, props: Record<string, unknown> = {}) {
  return {
    props: { label, value, ...props },
    schema: [{ props: { text: `${label} panel` }, type: "text" }],
    type: "tab",
  };
}

function renderTabs(
  tabsProps: Record<string, unknown> = {},
  tabs = [tab("Overview", "overview"), tab("Details", "details")],
) {
  return renderWithRegistry(
    withNavigation(
      <Renderer
        nodes={[
          {
            props: {
              activeValue: "",
              alignment: "stretch",
              defaultValue: "overview",
              orientation: "horizontal",
              queryKey: "tabs",
              ...tabsProps,
            },
            schema: tabs,
            type: "tabs",
          },
        ]}
      />,
    ),
    registry,
  );
}

describe("Tabs adapter", () => {
  beforeEach(() => {
    visit.mockClear();
    stubMatchMedia(true);
    window.history.replaceState({}, "", "/settings");
  });

  it("initializes and updates selection through the configured query key", () => {
    window.history.replaceState({}, "", "/settings?settings-tab=details");
    renderTabs({ queryKey: "settings-tab" });

    expect(screen.getByText("Details panel")).toBeVisible();

    fireEvent.click(screen.getByRole("tab", { name: "Overview" }));

    expect(window.location.search).toBe("?settings-tab=overview");
    expect(screen.getByText("Overview panel")).toBeVisible();
  });

  it("navigates without changing client selection when wire confirmation is required", () => {
    renderTabs({ activeValue: "overview" }, [
      tab("Overview", "overview"),
      tab("Danger", "danger", { confirm: { required: true } }),
    ]);

    fireEvent.click(screen.getByRole("tab", { name: "Danger" }));

    expect(visit).toHaveBeenCalledWith("/settings?tabs=danger", { preserveScroll: true });
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
  });
});

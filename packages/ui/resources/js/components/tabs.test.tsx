import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import { renderWithRegistry, TextProbe } from "@lattice-php/core/test-support";
import type { ReactNode } from "react";
import { defaultNavigation, NavigationProvider } from "../navigation";
import TabComponent, { TabsComponent } from "./tabs";

const visit = vi.fn();

function withNavigation(children: ReactNode) {
  return (
    <NavigationProvider adapter={{ ...defaultNavigation, visit }}>{children}</NavigationProvider>
  );
}

const registry = createRegistry({
  components: {
    tab: eagerComponent(TabComponent),
    tabs: eagerComponent(TabsComponent),
    text: eagerComponent(TextProbe),
  },
  name: "test/tabs",
});

function tab(label: string, value: string, props: Record<string, unknown> = {}) {
  return {
    schema: [{ props: { text: `${label} panel` }, type: "text" }],
    props: { label, value, ...props },
    type: "tab",
  };
}

function renderTabs(
  tabsProps: Record<string, unknown> = {},
  tabs = [tab("Overview", "overview"), tab("Details", "details"), tab("History", "history")],
) {
  return renderWithRegistry(
    withNavigation(
      <Renderer
        nodes={[
          {
            schema: tabs,
            props: {
              alignment: "stretch",
              defaultValue: "overview",
              orientation: "horizontal",
              queryKey: "tabs",
              ...tabsProps,
            },
            type: "tabs",
          },
        ]}
      />,
    ),
    registry,
  );
}

function stubMatchMedia(matches: boolean): void {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      matches,
      removeEventListener: vi.fn(),
    }),
  );
}

const fourTabs = [
  tab("Overview", "overview"),
  tab("Details", "details"),
  tab("History", "history"),
  tab("Danger", "danger"),
];

describe("Lattice tabs component", () => {
  beforeEach(() => {
    visit.mockClear();
    vi.unstubAllGlobals();
    window.history.replaceState({}, "", "/settings");
  });

  it("switches panels on the client, mounting inactive panels only when opened", () => {
    renderTabs();

    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Overview panel")).toBeVisible();
    expect(screen.queryByText("Details panel")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Details" }));

    expect(screen.getByRole("tab", { name: "Details" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Details panel")).toBeVisible();
    expect(screen.getByText("Overview panel")).not.toBeVisible();
    expect(window.location.search).toBe("?tabs=details");
    expect(visit).not.toHaveBeenCalled();
  });

  it("uses the configured query key for the initial active tab and url updates", () => {
    window.history.replaceState({}, "", "/settings?settings-tab=details");

    renderTabs({ queryKey: "settings-tab" });

    expect(screen.getByRole("tab", { name: "Details" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Details panel")).toBeVisible();

    fireEvent.click(screen.getByRole("tab", { name: "Overview" }));

    expect(window.location.search).toBe("?settings-tab=overview");
  });

  it("visits the query url when switching to a confirmed tab", () => {
    renderTabs({ activeValue: "overview" }, [
      tab("Overview", "overview"),
      tab("Details", "details", { confirm: { required: true } }),
    ]);

    fireEvent.click(screen.getByRole("tab", { name: "Details" }));

    expect(visit).toHaveBeenCalledWith("/settings?tabs=details", {
      preserveScroll: true,
    });
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
  });

  it("roves focus across tabs with arrow, home and end keys", () => {
    renderTabs();
    const tablist = screen.getByRole("tablist");
    const overview = screen.getByRole("tab", { name: "Overview" });
    const details = screen.getByRole("tab", { name: "Details" });
    const history = screen.getByRole("tab", { name: "History" });

    expect(tablist).toHaveAttribute("aria-orientation", "horizontal");
    expect(overview).toHaveAttribute("tabindex", "0");
    expect(details).toHaveAttribute("tabindex", "-1");

    overview.focus();
    fireEvent.keyDown(overview, { key: "ArrowRight" });
    expect(details).toHaveFocus();

    fireEvent.keyDown(details, { key: "ArrowRight" });
    expect(history).toHaveFocus();

    fireEvent.keyDown(history, { key: "ArrowRight" });
    expect(overview).toHaveFocus();

    fireEvent.keyDown(overview, { key: "End" });
    expect(history).toHaveFocus();

    fireEvent.keyDown(history, { key: "Home" });
    expect(overview).toHaveFocus();

    fireEvent.keyDown(overview, { key: "ArrowLeft" });
    expect(history).toHaveFocus();
  });

  it("marks the active vertical tab with the rail accent", () => {
    renderTabs({ orientation: "vertical" });

    const tablist = screen.getByRole("tablist");
    const overview = screen.getByRole("tab", { name: "Overview" });
    const details = screen.getByRole("tab", { name: "Details" });

    expect(tablist).toHaveClass("w-44", "flex-col", "self-start");
    expect(tablist).not.toHaveClass("bg-lt-muted");
    expect(overview.className).toContain("before:bg-lt-primary");
    expect(details.className).not.toContain("before:bg-lt-primary");
  });

  it("collapses to a native select on mobile with more than three tabs", () => {
    stubMatchMedia(false);
    renderTabs({ orientation: "vertical" }, fourTabs);

    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    const select = screen.getByRole("combobox", { name: "Tabs" });
    expect(select).toHaveValue("overview");
    expect(screen.getByText("Overview panel")).toBeVisible();

    fireEvent.change(select, { target: { value: "details" } });

    expect(select).toHaveValue("details");
    expect(screen.getByText("Details panel")).toBeVisible();
    expect(screen.getByText("Overview panel")).not.toBeVisible();
    expect(window.location.search).toBe("?tabs=details");
    expect(visit).not.toHaveBeenCalled();
  });

  it("keeps a horizontal tablist on mobile with three or fewer tabs", () => {
    stubMatchMedia(false);
    renderTabs();

    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("always collapses vertical tabs to a select on mobile", () => {
    stubMatchMedia(false);
    renderTabs({ orientation: "vertical" }, [
      tab("Overview", "overview"),
      tab("Details", "details"),
    ]);

    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Tabs" })).toHaveValue("overview");
  });

  it("visits the query url when the mobile select picks a confirmed tab", () => {
    stubMatchMedia(false);
    renderTabs({ activeValue: "overview" }, [
      ...fourTabs.slice(0, 3),
      tab("Danger", "danger", { confirm: { required: true } }),
    ]);

    fireEvent.change(screen.getByRole("combobox", { name: "Tabs" }), {
      target: { value: "danger" },
    });

    expect(visit).toHaveBeenCalledWith("/settings?tabs=danger", { preserveScroll: true });
  });

  it("lays out vertical tabs and roves focus with up and down arrows", () => {
    renderTabs({ orientation: "vertical" });
    const tablist = screen.getByRole("tablist");
    const overview = screen.getByRole("tab", { name: "Overview" });
    const details = screen.getByRole("tab", { name: "Details" });

    expect(tablist).toHaveAttribute("aria-orientation", "vertical");

    overview.focus();
    fireEvent.keyDown(overview, { key: "ArrowDown" });
    expect(details).toHaveFocus();

    fireEvent.keyDown(details, { key: "ArrowUp" });
    expect(overview).toHaveFocus();

    fireEvent.keyDown(overview, { key: "ArrowRight" });
    expect(overview).toHaveFocus();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { router } from "@inertiajs/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice/lattice/core/registry";
import { Renderer } from "@lattice/lattice/core/renderer";
import type { RendererComponent } from "@lattice/lattice/core/types";
import TabComponent, { TabsComponent } from "./tabs";

vi.mock("@inertiajs/react", () => ({
  router: {
    visit: vi.fn<(url: string, options?: unknown) => void>(),
  },
}));

const TextProbe: RendererComponent<"text"> = ({ node }) => <span>{String(node.props?.text)}</span>;

function renderTabs(tabsProps: Record<string, unknown>) {
  const registry = createRegistry({
    components: {
      tab: eagerComponent(TabComponent),
      tabs: eagerComponent(TabsComponent),
      text: eagerComponent(TextProbe),
    },
    name: "test/tabs",
  });

  const tab = (label: string, value: string) => ({
    schema: [{ props: { text: `${label} panel` }, type: "text" }],
    props: { label, value },
    type: "tab",
  });

  return render(
    <Renderer
      nodes={[
        {
          schema: [
            tab("Overview", "overview"),
            tab("Details", "details"),
            tab("History", "history"),
          ],
          props: { defaultValue: "overview", queryKey: "tabs", ...tabsProps },
          type: "tabs",
        },
      ]}
      registry={registry}
    />,
  );
}

describe("Lattice tabs component", () => {
  beforeEach(() => {
    vi.mocked(router.visit).mockClear();
    window.history.replaceState({}, "", "/settings");
  });

  it("switches panels on the client without navigation", () => {
    const registry = createRegistry({
      components: {
        tab: eagerComponent(TabComponent),
        tabs: eagerComponent(TabsComponent),
        text: eagerComponent(TextProbe),
      },
      name: "test/tabs",
    });

    render(
      <Renderer
        nodes={[
          {
            schema: [
              {
                schema: [
                  {
                    props: {
                      text: "Profile form",
                    },
                    type: "text",
                  },
                ],
                props: {
                  label: "Profile",
                  value: "profile",
                },
                type: "tab",
              },
              {
                schema: [
                  {
                    props: {
                      text: "Security form",
                    },
                    type: "text",
                  },
                ],
                props: {
                  label: "Security",
                  value: "security",
                },
                type: "tab",
              },
            ],
            props: {
              defaultValue: "profile",
              queryKey: "tabs",
            },
            type: "tabs",
          },
        ]}
        registry={registry}
      />,
    );

    expect(screen.getByRole("tab", { name: "Profile" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Profile form")).toBeVisible();
    expect(screen.queryByText("Security form")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Security" }));

    expect(screen.getByRole("tab", { name: "Security" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Security form")).toBeVisible();
    expect(screen.getByText("Profile form")).not.toBeVisible();
    expect(window.location.search).toBe("?tabs=security");
  });

  it("uses the configured query key for the initial active tab and url updates", () => {
    window.history.replaceState({}, "", "/settings?settings-tab=security");

    const registry = createRegistry({
      components: {
        tab: eagerComponent(TabComponent),
        tabs: eagerComponent(TabsComponent),
        text: eagerComponent(TextProbe),
      },
      name: "test/tabs",
    });

    render(
      <Renderer
        nodes={[
          {
            schema: [
              {
                schema: [
                  {
                    props: {
                      text: "Profile form",
                    },
                    type: "text",
                  },
                ],
                props: {
                  label: "Profile",
                  value: "profile",
                },
                type: "tab",
              },
              {
                schema: [
                  {
                    props: {
                      text: "Security form",
                    },
                    type: "text",
                  },
                ],
                props: {
                  label: "Security",
                  value: "security",
                },
                type: "tab",
              },
            ],
            props: {
              defaultValue: "profile",
              queryKey: "settings-tab",
            },
            type: "tabs",
          },
        ]}
        registry={registry}
      />,
    );

    expect(screen.getByRole("tab", { name: "Security" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Security form")).toBeVisible();

    fireEvent.click(screen.getByRole("tab", { name: "Profile" }));

    expect(window.location.search).toBe("?settings-tab=profile");
  });

  it("visits the query url when switching to a confirmed tab", () => {
    const registry = createRegistry({
      components: {
        tab: eagerComponent(TabComponent),
        tabs: eagerComponent(TabsComponent),
        text: eagerComponent(TextProbe),
      },
      name: "test/tabs",
    });

    render(
      <Renderer
        nodes={[
          {
            schema: [
              {
                schema: [
                  {
                    props: {
                      text: "Profile form",
                    },
                    type: "text",
                  },
                ],
                props: {
                  label: "Profile",
                  value: "profile",
                },
                type: "tab",
              },
              {
                props: {
                  confirm: {
                    required: true,
                  },
                  label: "Security",
                  value: "security",
                },
                type: "tab",
              },
            ],
            props: {
              activeValue: "profile",
              defaultValue: "profile",
              queryKey: "tabs",
            },
            type: "tabs",
          },
        ]}
        registry={registry}
      />,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Security" }));

    expect(router.visit).toHaveBeenCalledWith("/settings?tabs=security", {
      preserveScroll: true,
    });
    expect(screen.getByRole("tab", { name: "Profile" })).toHaveAttribute("aria-selected", "true");
  });

  it("only renders inactive panel children after the tab is opened", () => {
    const registry = createRegistry({
      components: {
        tab: eagerComponent(TabComponent),
        tabs: eagerComponent(TabsComponent),
        text: eagerComponent(TextProbe),
      },
      name: "test/tabs",
    });

    render(
      <Renderer
        nodes={[
          {
            schema: [
              {
                schema: [
                  {
                    props: {
                      text: "Loaded immediately",
                    },
                    type: "text",
                  },
                ],
                props: {
                  label: "Initial",
                  value: "initial",
                },
                type: "tab",
              },
              {
                schema: [
                  {
                    props: {
                      text: "Loaded after opening",
                    },
                    type: "text",
                  },
                ],
                props: {
                  label: "Later",
                  value: "later",
                },
                type: "tab",
              },
            ],
            props: {
              defaultValue: "initial",
            },
            type: "tabs",
          },
        ]}
        registry={registry}
      />,
    );

    expect(screen.getByText("Loaded immediately")).toBeVisible();
    expect(screen.queryByText("Loaded after opening")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Later" }));

    expect(screen.getByText("Loaded after opening")).toBeVisible();
  });

  it("roves focus across tabs with arrow, home and end keys", () => {
    renderTabs({});
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

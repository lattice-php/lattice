import { fireEvent, render, screen } from "@testing-library/react";
import { router } from "@inertiajs/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@bambamboole/lattice/core/registry";
import { Renderer } from "@bambamboole/lattice/core/renderer";
import type { RendererComponent } from "@bambamboole/lattice/core/types";
import TabComponent, { TabsComponent } from "./tabs";

vi.mock("@inertiajs/react", () => ({
  router: {
    visit: vi.fn<(url: string, options?: unknown) => void>(),
  },
}));

const TextProbe: RendererComponent<"text"> = ({ node }) => <span>{String(node.props?.text)}</span>;

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
            children: [
              {
                children: [
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
                children: [
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
            children: [
              {
                children: [
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
                children: [
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
            children: [
              {
                children: [
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
            children: [
              {
                children: [
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
                children: [
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
});

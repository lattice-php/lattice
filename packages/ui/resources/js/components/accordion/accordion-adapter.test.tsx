import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import { renderWithRegistry } from "@lattice-php/core/test-support";
import type { Node } from "@lattice-php/core/types";
import { CollapsibleAdapter } from "../collapsible/collapsible-adapter";
import { SectionAdapter } from "../section/section-adapter";
import { TextAdapter } from "../text/text-adapter";
import { AccordionAdapter } from "./accordion-adapter";

const registry = createRegistry({
  components: {
    accordion: eagerComponent(AccordionAdapter),
    collapsible: eagerComponent(CollapsibleAdapter),
    section: eagerComponent(SectionAdapter),
    text: eagerComponent(TextAdapter),
  },
  name: "test/accordion-adapter",
});

function collapsibleNode(key: string, schema: Node[] = []): Node {
  return {
    key,
    type: "collapsible",
    props: { rememberState: true, trigger: [{ type: "text", props: { text: `${key} trigger` } }] },
    schema: [{ type: "text", props: { text: `${key} body` } }, ...schema],
  };
}

describe("AccordionAdapter", () => {
  beforeEach(() => window.localStorage.clear());

  it("coordinates collapsible children so opening one closes the other without persisting", async () => {
    renderWithRegistry(
      <Renderer
        nodes={[
          {
            key: "criteria",
            type: "accordion",
            props: { defaultOpen: null, gap: null },
            schema: [collapsibleNode("first"), collapsibleNode("second")],
          },
        ]}
      />,
      registry,
    );

    const first = screen.getByTestId("collapsible-toggle-first");
    const second = screen.getByTestId("collapsible-toggle-second");

    fireEvent.click(first);
    await waitFor(() => expect(first).toHaveAttribute("aria-expanded", "true"));

    fireEvent.click(second);
    await waitFor(() => expect(second).toHaveAttribute("aria-expanded", "true"));
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("first body")).not.toBeInTheDocument();
    expect(window.localStorage.getItem("lattice:collapsible:first")).toBeNull();
  });

  it("opens the default item and keeps a nested collapsible out of the group", async () => {
    renderWithRegistry(
      <Renderer
        nodes={[
          {
            key: "criteria",
            type: "accordion",
            props: { defaultOpen: "first", gap: null },
            schema: [
              collapsibleNode("first", [collapsibleNode("first-detail")]),
              collapsibleNode("second"),
            ],
          },
        ]}
      />,
      registry,
    );

    const first = screen.getByTestId("collapsible-toggle-first");
    expect(first).toHaveAttribute("aria-expanded", "true");

    const nested = screen.getByTestId("collapsible-toggle-first-detail");
    fireEvent.click(nested);
    await waitFor(() => expect(nested).toHaveAttribute("aria-expanded", "true"));
    expect(first).toHaveAttribute("aria-expanded", "true");
  });

  it("coordinates collapsible section children the same way", async () => {
    renderWithRegistry(
      <Renderer
        nodes={[
          {
            key: "areas",
            type: "accordion",
            props: { defaultOpen: null, gap: "md" },
            schema: [
              {
                key: "eco",
                type: "section",
                props: {
                  title: "Ecology",
                  collapsible: true,
                  collapsed: true,
                  rememberState: true,
                },
                schema: [{ type: "text", props: { text: "Ecology body" } }],
              },
              {
                key: "social",
                type: "section",
                props: { title: "Social", collapsible: true, collapsed: true, rememberState: true },
                schema: [{ type: "text", props: { text: "Social body" } }],
              },
            ],
          },
        ]}
      />,
      registry,
    );

    fireEvent.click(screen.getByTestId("section-toggle-eco"));
    await waitFor(() => expect(screen.getByText("Ecology body")).toBeVisible());

    fireEvent.click(screen.getByTestId("section-toggle-social"));
    await waitFor(() => expect(screen.getByText("Social body")).toBeVisible());
    expect(screen.queryByText("Ecology body")).not.toBeInTheDocument();
    expect(window.localStorage.getItem("lattice:section:eco")).toBeNull();
  });
});

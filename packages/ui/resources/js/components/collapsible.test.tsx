import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import { renderWithRegistry } from "@lattice-php/core/test-support";
import type { Node } from "@lattice-php/core/types";
import CollapsibleComponent from "./collapsible";
import StackComponent from "./stack";
import TextComponent from "./text";

const registry = createRegistry({
  components: {
    collapsible: eagerComponent(CollapsibleComponent),
    stack: eagerComponent(StackComponent),
    text: eagerComponent(TextComponent),
  },
  name: "test/collapsible",
});

function renderCollapsible(node: Node) {
  return renderWithRegistry(<Renderer nodes={[node]} />, registry);
}

describe("Collapsible component", () => {
  beforeEach(() => window.localStorage.clear());

  it("renders a flow-content trigger through the client collapsible", async () => {
    renderCollapsible({
      id: "name",
      type: "collapsible",
      props: {
        trigger: [
          {
            type: "stack",
            props: {
              align: "center",
              direction: "row",
              float: null,
              gap: "md",
              height: null,
              justify: "between",
              width: "fill",
            },
            schema: [{ type: "text", props: { text: "Name" } }],
          },
        ],
      },
      schema: [{ type: "text", props: { text: "Hidden body" } }],
    });

    const toggle = screen.getByTestId("collapsible-toggle-name");
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);

    await waitFor(() => expect(toggle).toHaveAttribute("aria-expanded", "true"));
    expect(await screen.findByText("Hidden body")).toBeVisible();

    fireEvent.click(toggle);

    await waitFor(() => expect(toggle).toHaveAttribute("aria-expanded", "false"));
    expect(screen.queryByText("Hidden body")).not.toBeInTheDocument();
  });

  it("maps an expanded wire state without persisting later changes", async () => {
    renderCollapsible({
      id: "name",
      type: "collapsible",
      props: {
        collapsed: false,
        rememberState: false,
        trigger: [{ type: "text", props: { text: "Name" } }],
      },
      schema: [{ type: "text", props: { text: "Hidden body" } }],
    });

    const toggle = screen.getByTestId("collapsible-toggle-name");
    const content = screen.getByText("Hidden body");

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(content).toBeVisible();

    fireEvent.click(toggle);

    await waitFor(() => expect(toggle).toHaveAttribute("aria-expanded", "false"));
    expect(screen.queryByText("Hidden body")).not.toBeInTheDocument();
    expect(window.localStorage.getItem("lattice:collapsible:name")).toBeNull();
  });

  it("maps remembered state to storage scoped by the wire identity", async () => {
    window.localStorage.setItem("lattice:collapsible:name", "true");

    renderCollapsible({
      id: "name",
      type: "collapsible",
      props: { rememberState: true, trigger: [{ type: "text", props: { text: "Name" } }] },
      schema: [{ type: "text", props: { text: "Hidden body" } }],
    });

    const toggle = screen.getByTestId("collapsible-toggle-name");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Hidden body")).toBeVisible();

    fireEvent.click(toggle);

    await waitFor(() =>
      expect(window.localStorage.getItem("lattice:collapsible:name")).toBe("false"),
    );
    expect(screen.queryByText("Hidden body")).not.toBeInTheDocument();
  });
});

import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import { renderWithRegistry } from "@lattice-php/core/test-support";
import type { Node } from "@lattice-php/core/types";
import CollapsibleComponent from "./collapsible";
import TextComponent from "./text";

const registry = createRegistry({
  components: {
    collapsible: eagerComponent(CollapsibleComponent),
    text: eagerComponent(TextComponent),
  },
  name: "test/collapsible",
});

function renderCollapsible(node: Node) {
  return renderWithRegistry(<Renderer nodes={[node]} />, registry);
}

describe("Collapsible component", () => {
  beforeEach(() => window.localStorage.clear());

  it("renders wire content through the client disclosure", async () => {
    renderCollapsible({
      id: "name",
      type: "collapsible",
      props: { trigger: [{ type: "text", props: { text: "Name" } }] },
      schema: [{ type: "text", props: { text: "Hidden body" } }],
    });

    const disclosure = screen.getByTestId("collapsible-toggle-name").closest("details");
    expect(disclosure?.open).toBe(false);

    fireEvent.click(screen.getByTestId("collapsible-toggle-name"));

    await waitFor(() => expect(disclosure?.open).toBe(true));
    expect(await screen.findByText("Hidden body")).toBeVisible();

    fireEvent.click(screen.getByTestId("collapsible-toggle-name"));

    await waitFor(() => expect(disclosure?.open).toBe(false));
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
    const disclosure = toggle.closest("details");
    const content = screen.getByText("Hidden body");

    expect(disclosure?.open).toBe(true);
    expect(content).toBeVisible();

    fireEvent.click(toggle);

    await waitFor(() => expect(disclosure?.open).toBe(false));
    expect(screen.queryByText("Hidden body")).not.toBeInTheDocument();
    expect(window.localStorage.getItem("lattice:collapsible:name")).toBeNull();
  });

  it("persists native disclosure state changes when rememberState is set", async () => {
    renderCollapsible({
      id: "name",
      type: "collapsible",
      props: { rememberState: true, trigger: [{ type: "text", props: { text: "Name" } }] },
      schema: [{ type: "text", props: { text: "Hidden body" } }],
    });

    const toggle = screen.getByTestId("collapsible-toggle-name");
    fireEvent.click(toggle);

    await waitFor(() =>
      expect(window.localStorage.getItem("lattice:collapsible:name")).toBe("true"),
    );

    fireEvent.click(toggle);

    await waitFor(() =>
      expect(window.localStorage.getItem("lattice:collapsible:name")).toBe("false"),
    );
  });

  it("restores persisted state and ignores the collapsed fallback", async () => {
    window.localStorage.setItem("lattice:collapsible:name", "true");

    renderCollapsible({
      id: "name",
      type: "collapsible",
      props: { rememberState: true, trigger: [{ type: "text", props: { text: "Name" } }] },
      schema: [{ type: "text", props: { text: "Hidden body" } }],
    });

    const disclosure = screen.getByTestId("collapsible-toggle-name").closest("details");
    expect(disclosure?.open).toBe(true);
    expect(screen.getByText("Hidden body")).toBeVisible();

    fireEvent.click(screen.getByTestId("collapsible-toggle-name"));

    await waitFor(() => expect(disclosure?.open).toBe(false));
    expect(screen.queryByText("Hidden body")).not.toBeInTheDocument();
  });
});

import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/lattice/core/registry";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import type { Node } from "@lattice-php/lattice/core/types";
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
  it("renders the trigger and hides the content until opened", () => {
    renderCollapsible({
      id: "name",
      type: "collapsible",
      props: { trigger: [{ type: "text", props: { text: "Name" } }] },
      schema: [{ type: "text", props: { text: "Hidden body" } }],
    });

    expect(screen.getByText("Name")).toBeVisible();
    expect(screen.queryByText("Hidden body")).not.toBeInTheDocument();
  });

  it("toggles its content on click", () => {
    renderCollapsible({
      id: "name",
      type: "collapsible",
      props: { trigger: [{ type: "text", props: { text: "Name" } }] },
      schema: [{ type: "text", props: { text: "Hidden body" } }],
    });

    const toggle = screen.getByRole("button", { name: "Name" });

    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    expect(screen.getByText("Hidden body")).toBeVisible();
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(toggle);
    expect(screen.queryByText("Hidden body")).not.toBeInTheDocument();
  });

  it("starts open when collapsed is false", () => {
    renderCollapsible({
      id: "name",
      type: "collapsible",
      props: { collapsed: false, trigger: [{ type: "text", props: { text: "Name" } }] },
      schema: [{ type: "text", props: { text: "Hidden body" } }],
    });

    expect(screen.getByText("Hidden body")).toBeVisible();
  });

  it("toggles with the Enter and Space keys", () => {
    renderCollapsible({
      id: "name",
      type: "collapsible",
      props: { trigger: [{ type: "text", props: { text: "Name" } }] },
      schema: [{ type: "text", props: { text: "Hidden body" } }],
    });

    const toggle = screen.getByRole("button", { name: "Name" });

    fireEvent.keyDown(toggle, { key: "Enter" });
    expect(screen.getByText("Hidden body")).toBeVisible();

    fireEvent.keyDown(toggle, { key: " " });
    expect(screen.queryByText("Hidden body")).not.toBeInTheDocument();
  });

  it("persists the open state when rememberState is set", () => {
    window.localStorage.clear();

    renderCollapsible({
      id: "name",
      type: "collapsible",
      props: { rememberState: true, trigger: [{ type: "text", props: { text: "Name" } }] },
      schema: [{ type: "text", props: { text: "Hidden body" } }],
    });

    fireEvent.click(screen.getByRole("button", { name: "Name" }));

    expect(window.localStorage.getItem("lattice:collapsible:name")).toBe("true");
    window.localStorage.clear();
  });

  it("restores the persisted open state", () => {
    window.localStorage.setItem("lattice:collapsible:name", "true");

    renderCollapsible({
      id: "name",
      type: "collapsible",
      props: { rememberState: true, trigger: [{ type: "text", props: { text: "Name" } }] },
      schema: [{ type: "text", props: { text: "Hidden body" } }],
    });

    expect(screen.getByText("Hidden body")).toBeVisible();
    window.localStorage.clear();
  });

  it("opens the tooltip without toggling the collapse", () => {
    renderCollapsible({
      id: "name",
      type: "collapsible",
      props: {
        tooltip: "Reveals the edit form.",
        trigger: [{ type: "text", props: { text: "Name" } }],
      },
      schema: [{ type: "text", props: { text: "Hidden body" } }],
    });

    const toggle = screen.getByRole("button", { name: /Name/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(screen.getByRole("button", { name: "More information" }));

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Hidden body")).not.toBeInTheDocument();
    expect(screen.getByText("Reveals the edit form.")).toBeVisible();
  });
});

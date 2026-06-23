import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/lattice/core/registry";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import type { Node } from "@lattice-php/lattice/core/types";
import ButtonComponent from "./button";
import SectionComponent from "./section";
import TextComponent from "./text";

const registry = createRegistry({
  components: {
    button: eagerComponent(ButtonComponent),
    section: eagerComponent(SectionComponent),
    text: eagerComponent(TextComponent),
  },
  name: "test/section",
});

function renderSection(node: Node) {
  return renderWithRegistry(<Renderer nodes={[node]} />, registry);
}

describe("Section component", () => {
  it("renders the title, description, content, and header actions", () => {
    renderSection({
      id: "members",
      type: "section",
      props: {
        title: "Members",
        description: "People with access.",
        headerActions: [{ type: "button", props: { label: "Invite", buttonType: "button" } }],
      },
      schema: [{ type: "text", props: { text: "Three people have access." } }],
    });

    expect(screen.getByText("Members")).toBeVisible();
    expect(screen.getByText("People with access.")).toBeVisible();
    expect(screen.getByText("Three people have access.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Invite" })).toBeVisible();
  });

  it("reveals a tooltip next to the title on click", () => {
    renderSection({
      id: "members",
      type: "section",
      props: { title: "Members", tooltip: "People with access." },
      schema: [],
    });

    fireEvent.click(screen.getByRole("button", { name: "More information" }));
    expect(screen.getByText("People with access.")).toBeVisible();
  });

  it("anchors the tooltip to the description when there is no title", () => {
    renderSection({
      id: "members",
      type: "section",
      props: { description: "People with access.", tooltip: "Only admins can change this." },
      schema: [],
    });

    fireEvent.click(screen.getByRole("button", { name: "More information" }));
    expect(screen.getByText("Only admins can change this.")).toBeVisible();
  });

  it("toggles its content when collapsible", () => {
    renderSection({
      id: "advanced",
      type: "section",
      props: { title: "Advanced", collapsible: true, rememberState: false },
      schema: [{ type: "text", props: { text: "Hidden body" } }],
    });

    expect(screen.getByText("Hidden body")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Collapse section" }));
    expect(screen.queryByText("Hidden body")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Expand section" }));
    expect(screen.getByText("Hidden body")).toBeVisible();
  });
});

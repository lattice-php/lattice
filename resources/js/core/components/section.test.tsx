import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice/lattice/core/registry";
import { Renderer } from "@lattice/lattice/core/renderer";
import type { Node } from "@lattice/lattice/core/types";
import ButtonComponent from "./button";
import SectionComponent from "./section";
import TextComponent from "./text";

const { components: registry } = createRegistry({
  components: {
    button: eagerComponent(ButtonComponent),
    section: eagerComponent(SectionComponent),
    text: eagerComponent(TextComponent),
  },
  name: "test/section",
});

function renderSection(node: Node) {
  return render(<Renderer nodes={[node]} registry={registry} />);
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

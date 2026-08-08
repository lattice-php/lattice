import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import type { Node } from "@lattice-php/core/types";
import { fakeNode, renderWithRegistry } from "@lattice-php/core/test-support";
import CardComponent from "./card";
import ButtonComponent from "./button";

const registry = createRegistry({
  components: { button: eagerComponent(ButtonComponent) },
  name: "test/card",
});

function renderCard(props: Node<"card">["props"]) {
  const node = fakeNode({ type: "card", props });
  return render(<CardComponent node={node}>{null}</CardComponent>);
}

function renderCardWithSchema(props: Node<"card">["props"]) {
  const node = fakeNode({ type: "card", props });
  return renderWithRegistry(<CardComponent node={node}>{null}</CardComponent>, registry);
}

describe("CardComponent tooltip", () => {
  it("reveals the tooltip content next to the title on click", () => {
    renderCard({ title: "Plan", description: null, tooltip: "Billed monthly.", headerActions: [] });

    fireEvent.click(screen.getByRole("button", { name: "More information" }));
    expect(screen.getByText("Billed monthly.")).toBeVisible();
  });

  it("anchors the tooltip to the description when there is no title", () => {
    renderCard({ title: null, description: "Some detail", tooltip: "Extra.", headerActions: [] });

    fireEvent.click(screen.getByRole("button", { name: "More information" }));
    expect(screen.getByText("Extra.")).toBeVisible();
  });
});

describe("CardComponent headerActions", () => {
  it("renders header actions right-aligned next to the title", () => {
    const actionNode = fakeNode({ type: "button", props: { label: "Edit" } });

    renderCardWithSchema({
      title: "Plan",
      description: null,
      tooltip: null,
      headerActions: [actionNode],
    });

    expect(screen.getByRole("button", { name: "Edit" })).toBeVisible();
  });

  it("renders no header actions when the list is empty", () => {
    renderCard({ title: "Plan", description: null, tooltip: null, headerActions: [] });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

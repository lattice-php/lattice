import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import { fakeNode } from "@lattice-php/lattice/test-support";
import CardComponent from "./card";

function renderCard(props: Node<"card">["props"]) {
  const node = fakeNode({ type: "card", props });
  return render(<CardComponent node={node}>{null}</CardComponent>);
}

describe("CardComponent tooltip", () => {
  it("renders no info trigger when there is no tooltip", () => {
    renderCard({ title: "Plan", description: null, tooltip: null });

    expect(screen.getByText("Plan")).toBeVisible();
    expect(screen.queryByRole("button", { name: "More information" })).not.toBeInTheDocument();
  });

  it("reveals the tooltip content next to the title on click", () => {
    renderCard({ title: "Plan", description: null, tooltip: "Billed monthly." });

    fireEvent.click(screen.getByRole("button", { name: "More information" }));
    expect(screen.getByText("Billed monthly.")).toBeVisible();
  });

  it("anchors the tooltip to the description when there is no title", () => {
    renderCard({ title: null, description: "Some detail", tooltip: "Extra." });

    fireEvent.click(screen.getByRole("button", { name: "More information" }));
    expect(screen.getByText("Extra.")).toBeVisible();
  });
});

import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/lattice/core/registry";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import type { Node } from "@lattice-php/lattice/core/types";
import BadgeComponent from "./badge";
import TooltipComponent from "./tooltip";

const registry = createRegistry({
  components: {
    badge: eagerComponent(BadgeComponent),
    tooltip: eagerComponent(TooltipComponent),
  },
  name: "test/tooltip",
});

function renderTooltip(node: Node) {
  return renderWithRegistry(<Renderer nodes={[node]} />, registry);
}

describe("TooltipComponent", () => {
  it("renders nothing when content is empty", () => {
    const { container } = renderTooltip({ type: "tooltip", props: { content: null, trigger: [] } });
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the content from a bare info icon when no trigger is given", () => {
    renderTooltip({ type: "tooltip", props: { content: "Hello there.", trigger: [] } });

    expect(screen.queryByText("Hello there.")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "More information" }));
    expect(screen.getByText("Hello there.")).toBeVisible();
  });

  it("uses a custom trigger to reveal the content", () => {
    renderTooltip({
      type: "tooltip",
      props: { content: "Still in beta.", trigger: [{ type: "badge", props: { label: "Beta" } }] },
    });

    fireEvent.click(screen.getByText("Beta"));
    expect(screen.getByText("Still in beta.")).toBeVisible();
  });
});

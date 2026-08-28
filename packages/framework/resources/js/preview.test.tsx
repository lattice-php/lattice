import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { eagerComponent } from "@lattice-php/core/registry";
import type { Node } from "@lattice-php/core";
import { createPreviewRegistry, LatticePreview } from "./preview";

describe("LatticePreview", () => {
  it("renders a node schema without an Inertia app or server", () => {
    const nodes: Node[] = [
      {
        type: "stack",
        props: { direction: "column" },
        schema: [
          { type: "heading", props: { text: "Quote A-2026-0007", level: 2 } },
          { type: "text", props: { text: "Nexora Industries SE" } },
        ],
      } as unknown as Node,
    ];

    render(<LatticePreview nodes={nodes} />);

    expect(screen.getByRole("heading", { name: "Quote A-2026-0007" })).toBeVisible();
    expect(screen.getByText("Nexora Industries SE")).toBeVisible();
  });

  it("resolves opt-in plugin components through createPreviewRegistry", () => {
    const plugin = {
      name: "fixture",
      components: {
        "fixture.probe": eagerComponent<"fixture.probe">(() => <div>plugin probe</div>),
      },
    };

    render(
      <LatticePreview
        nodes={[{ type: "fixture.probe", props: {} } as unknown as Node]}
        registry={createPreviewRegistry(plugin)}
      />,
    );

    expect(screen.getByText("plugin probe")).toBeVisible();
  });
});

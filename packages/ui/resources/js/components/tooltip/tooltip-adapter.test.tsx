import { fireEvent, screen } from "@testing-library/react";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import { renderWithRegistry } from "@lattice-php/core/test-support";
import type { Node } from "@lattice-php/core/types";
import { describe, expect, it } from "vitest";
import { BadgeAdapter } from "../badge/badge-adapter";
import { TooltipAdapter } from "./tooltip-adapter";

const registry = createRegistry({
  components: {
    badge: eagerComponent(BadgeAdapter),
    tooltip: eagerComponent(TooltipAdapter),
  },
  name: "test/tooltip-adapter",
});

describe("Tooltip adapter", () => {
  it("renders a wire trigger and trusted server HTML through the client tooltip", () => {
    const node: Node = {
      props: {
        content: 'Read the <a href="/releases">release details</a>.',
        trigger: [{ props: { label: "Beta" }, type: "badge" }],
      },
      type: "tooltip",
    };

    renderWithRegistry(<Renderer nodes={[node]} />, registry);

    fireEvent.click(screen.getByRole("button", { name: "Beta" }));

    expect(screen.getByRole("link", { name: "release details" })).toHaveAttribute(
      "href",
      "/releases",
    );
  });
});

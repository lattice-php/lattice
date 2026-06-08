import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { LatticeNode } from "@/lattice/core/types";
import CardComponent from "./card";
import { TabsComponent } from "./tabs";

describe("Lattice component theming", () => {
  it("renders package surfaces with lt token utilities", () => {
    const card = {
      id: "settings.card",
      props: {
        body: "Body",
        title: "Title",
      },
      type: "card",
    } satisfies LatticeNode<"card">;

    const { container } = render(<CardComponent node={card}>{null}</CardComponent>);

    expect(container.firstElementChild).toHaveClass(
      "bg-lt-surface",
      "text-lt-surface-fg",
      "border-lt-border",
      "rounded-lt",
    );
  });

  it("renders package controls with lt token utilities", () => {
    const tabs = {
      id: "settings.tabs",
      children: [
        {
          id: "settings.profile",
          props: {
            label: "Profile",
            value: "profile",
          },
          type: "tab",
        },
      ],
      props: {},
      type: "tabs",
    } satisfies LatticeNode<"tabs">;

    const { getByRole } = render(<TabsComponent node={tabs}>{null}</TabsComponent>);

    expect(getByRole("tablist")).toHaveClass("bg-lt-muted", "rounded-lt");
    expect(getByRole("tab", { name: "Profile" })).toHaveClass(
      "bg-lt-bg",
      "text-lt-fg",
      "rounded-lt-sm",
    );
  });
});

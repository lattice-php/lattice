import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice/lattice/core/types";
import CardComponent, { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { TabsComponent } from "./tabs";

describe("Lattice component theming", () => {
  it("renders package surfaces with lt token utilities", () => {
    const card = {
      id: "settings.card",
      props: {
        description: "Description",
        title: "Title",
      },
      type: "card",
    } satisfies Node<"card">;

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
      schema: [
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
    } satisfies Node<"tabs">;

    const { getByRole } = render(<TabsComponent node={tabs}>{null}</TabsComponent>);

    expect(getByRole("tablist")).toHaveClass("bg-lt-muted", "rounded-lt");
    expect(getByRole("tab", { name: "Profile" })).toHaveClass(
      "bg-lt-bg",
      "text-lt-fg",
      "rounded-lt-sm",
    );
  });

  it("exports composable card primitives with lt token utilities", () => {
    const { getByText } = render(
      <Card>
        <CardHeader>
          <CardTitle>Recovery codes</CardTitle>
          <CardDescription>Keep these somewhere safe.</CardDescription>
        </CardHeader>
        <CardContent>Codes</CardContent>
      </Card>,
    );

    expect(getByText("Recovery codes")).toHaveClass("font-semibold");
    expect(getByText("Keep these somewhere safe.")).toHaveClass("text-lt-muted-fg");
    expect(getByText("Codes")).toHaveClass("px-6");
  });
});

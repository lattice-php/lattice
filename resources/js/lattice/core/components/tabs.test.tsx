import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createLatticeRegistry, eagerComponent } from "@/lattice/core/registry";
import { LatticeRenderer } from "@/lattice/core/renderer";
import type { LatticeRendererComponent } from "@/lattice/core/types";
import TabComponent, { TabsComponent } from "./tabs";

const TextProbe: LatticeRendererComponent<"text"> = ({ node }) => (
  <span>{String(node.props?.text)}</span>
);

describe("Lattice tabs component", () => {
  it("switches panels on the client without navigation", () => {
    const registry = createLatticeRegistry({
      components: {
        tab: eagerComponent(TabComponent),
        tabs: eagerComponent(TabsComponent),
        text: eagerComponent(TextProbe),
      },
      name: "test/tabs",
    });

    render(
      <LatticeRenderer
        nodes={[
          {
            children: [
              {
                children: [
                  {
                    props: {
                      text: "Profile form",
                    },
                    type: "text",
                  },
                ],
                props: {
                  label: "Profile",
                  value: "profile",
                },
                type: "tab",
              },
              {
                children: [
                  {
                    props: {
                      text: "Security form",
                    },
                    type: "text",
                  },
                ],
                props: {
                  label: "Security",
                  value: "security",
                },
                type: "tab",
              },
            ],
            props: {
              defaultValue: "profile",
            },
            type: "tabs",
          },
        ]}
        registry={registry}
      />,
    );

    expect(screen.getByRole("tab", { name: "Profile" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Profile form")).toBeVisible();
    expect(screen.getByText("Security form")).not.toBeVisible();

    fireEvent.click(screen.getByRole("tab", { name: "Security" }));

    expect(screen.getByRole("tab", { name: "Security" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Security form")).toBeVisible();
    expect(screen.getByText("Profile form")).not.toBeVisible();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createPlugin, createRegistry, eagerComponent, LatticeProvider } from "@/lattice";
import type { PagePayload, RendererComponent } from "@/lattice";
import LatticePage from "./page";

vi.mock("@inertiajs/react", () => ({
  Head: ({ title }: { title?: string }) => <title>{title}</title>,
}));

function payload(lattice: Partial<PagePayload> = {}): PagePayload {
  return {
    breadcrumbs: [],
    components: [],
    container: "default",
    layout: "none",
    menus: {},
    title: "Lattice",
    ...lattice,
  };
}

describe("Lattice page", () => {
  it("renders package components with the default registry", () => {
    render(
      <LatticePage
        lattice={payload({
          components: [
            {
              props: { text: "Package rendered" },
              type: "text",
            },
          ],
          container: "centered",
        })}
      />,
    );

    expect(screen.getByText("Package rendered")).toBeVisible();
    expect(screen.getByTestId("lattice-centered-container")).toBeVisible();
  });

  it("renders the default container for app shell pages", () => {
    render(
      <LatticePage
        lattice={payload({
          components: [
            {
              props: { text: "Inside the app shell" },
              type: "text",
            },
          ],
          layout: "app",
        })}
      />,
    );

    expect(screen.getByText("Inside the app shell")).toBeVisible();
    expect(screen.getByTestId("lattice-default-container")).toBeVisible();
    expect(screen.queryByTestId("lattice-centered-container")).not.toBeInTheDocument();
  });

  it("uses a provided registry for app and package extensions", () => {
    const CustomComponent: RendererComponent<"custom.message"> = ({ node }) => (
      <div>{String(node.props?.message ?? "")}</div>
    );
    const registry = createRegistry(
      createPlugin({
        components: {
          "custom.message": eagerComponent(CustomComponent),
        },
        name: "test/custom",
      }),
    );

    render(
      <LatticeProvider registry={registry}>
        <LatticePage
          lattice={payload({
            components: [
              {
                props: { message: "Custom registry component" },
                type: "custom.message",
              },
            ],
          })}
        />
      </LatticeProvider>,
    );

    expect(screen.getByText("Custom registry component")).toBeVisible();
  });
});

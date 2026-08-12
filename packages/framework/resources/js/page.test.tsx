import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent, Provider } from "@lattice-php/lattice";
import type { RendererComponent } from "@lattice-php/lattice";
import { payload } from "./test-support";
import Page from "./page";

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock(),
);

describe("Page", () => {
  it("renders package components with the default registry", () => {
    render(
      <Page
        lattice={payload({
          schema: [
            {
              props: { text: "Package rendered" },
              type: "text",
            },
          ],
        })}
      />,
    );

    expect(screen.getByText("Package rendered")).toBeVisible();
  });

  it("uses a provided registry for app and package extensions", () => {
    const CustomComponent: RendererComponent<"custom.message"> = ({ node }) => (
      <div>{String(node.props?.message ?? "")}</div>
    );
    const registry = createRegistry({
      components: {
        "custom.message": eagerComponent(CustomComponent),
      },
      name: "test/custom",
    });

    render(
      <Provider registry={registry}>
        <Page
          lattice={payload({
            schema: [
              {
                props: { message: "Custom registry component" },
                type: "custom.message",
              },
            ],
          })}
        />
      </Provider>,
    );

    expect(screen.getByText("Custom registry component")).toBeVisible();
  });
});

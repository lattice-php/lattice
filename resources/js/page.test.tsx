import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createPlugin, createRegistry, eagerComponent, Provider } from "@lattice-php/lattice";
import type { PagePayload, RendererComponent } from "@lattice-php/lattice";
import Page from "./page";

vi.mock("@inertiajs/react", () => ({
  Head: ({ title }: { title?: string }) => <title>{title}</title>,
  router: {
    on: vi.fn<(event: string, listener: (event: Event) => void) => () => void>(
      () => () => undefined,
    ),
  },
}));

function payload(lattice: Partial<PagePayload> = {}): PagePayload {
  return {
    breadcrumbs: [],
    listeners: [],
    schema: [],
    container: "default",
    layout: null,
    title: "Lattice",
    ...lattice,
  };
}

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
          container: "centered",
        })}
      />,
    );

    expect(screen.getByText("Package rendered")).toBeVisible();
    expect(screen.getByTestId("lattice-centered-container")).toBeVisible();
  });

  it("renders the default container for app shell pages", () => {
    render(
      <Page
        lattice={payload({
          schema: [
            {
              props: { text: "Inside the app shell" },
              type: "text",
            },
          ],
          layout: { key: "app", schema: [] },
        })}
      />,
    );

    expect(screen.getByText("Inside the app shell")).toBeVisible();
    expect(screen.getByTestId("lattice-default-container")).toBeVisible();
    expect(screen.queryByTestId("lattice-centered-container")).not.toBeInTheDocument();
  });

  it("does not mount realtime listeners for an empty listeners array", () => {
    render(
      <Page
        lattice={payload({
          schema: [{ props: { text: "No listeners rendered" }, type: "text" }],
          listeners: [],
        })}
      />,
    );
    expect(screen.getByText("No listeners rendered")).toBeVisible();
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

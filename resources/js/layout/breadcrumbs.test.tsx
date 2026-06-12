import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice/lattice/core/registry";
import { Renderer } from "@lattice/lattice/core/renderer";
import type { Node } from "@lattice/lattice/core/types";
import BreadcrumbsComponent from "./breadcrumbs";

const usePage = vi.fn();

vi.mock("@inertiajs/react", () => ({
  usePage: () => usePage(),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const { components: registry } = createRegistry({
  components: { breadcrumbs: eagerComponent(BreadcrumbsComponent) },
  name: "test/breadcrumbs",
});

const node: Node = { id: "b1", type: "breadcrumbs", props: {} };

describe("Breadcrumbs", () => {
  it("renders nothing when there are no breadcrumbs", () => {
    usePage.mockReturnValue({ props: { lattice: { breadcrumbs: [] } }, url: "/" });

    const { container } = render(<Renderer nodes={[node]} registry={registry} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders links for ancestors and plain text for the current page", () => {
    usePage.mockReturnValue({
      props: {
        lattice: {
          breadcrumbs: [
            { href: "/dashboard", title: "Dashboard" },
            { href: "/dashboard/settings", title: "Settings" },
          ],
        },
      },
      url: "/dashboard/settings",
    });

    render(<Renderer nodes={[node]} registry={registry} />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
    const current = screen.getByText("Settings");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: "Settings" })).not.toBeInTheDocument();
  });
});

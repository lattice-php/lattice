import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import { fakeNode, renderWithRegistry } from "@lattice-php/core/test-support";
import BreadcrumbsAdapter from "./breadcrumbs-adapter";

const registry = createRegistry({
  components: { breadcrumbs: eagerComponent(BreadcrumbsAdapter) },
  name: "test/breadcrumbs-adapter",
});

describe("BreadcrumbsAdapter", () => {
  it("maps the serialized trail onto linked ancestors and the current page", () => {
    const node = fakeNode({
      id: "trail",
      props: {
        items: [
          { href: "/dashboard", title: "Dashboard" },
          { href: "/dashboard/settings", title: "Settings" },
        ],
      },
      type: "breadcrumbs",
    });

    renderWithRegistry(<Renderer nodes={[node]} />, registry);

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveAttribute(
      "data-lattice-component",
      "trail",
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByText("Settings")).toHaveAttribute("aria-current", "page");
  });
});

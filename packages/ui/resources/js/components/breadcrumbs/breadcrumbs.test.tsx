import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Breadcrumbs } from "./breadcrumbs";

describe("Breadcrumbs", () => {
  it("links ancestors, marks the last item as the current page, and disappears without items", () => {
    const { container, rerender } = render(
      <Breadcrumbs
        items={[
          { href: "/dashboard", label: "Dashboard" },
          { label: "Archive" },
          { href: "/dashboard/settings", label: "Settings" },
        ]}
      />,
    );

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByText("Archive")).not.toHaveAttribute("aria-current");
    expect(screen.getByText("Settings")).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: "Settings" })).not.toBeInTheDocument();

    rerender(<Breadcrumbs items={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});

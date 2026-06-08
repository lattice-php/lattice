import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { IconRendererProvider } from "@/lattice/icons";
import type { LatticeIconRenderer } from "@/lattice/icons";
import { LatticeSidebar } from "./sidebar";

vi.mock("@inertiajs/react", () => ({
  Link: ({
    children,
    href,
    prefetch,
    ...props
  }: {
    children: ReactNode;
    href: string;
    prefetch?: boolean;
    [key: string]: unknown;
  }) => (
    <a data-prefetch={prefetch ? "true" : undefined} href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Lattice sidebar", () => {
  it("renders grouped links and icons", () => {
    const iconRenderer = vi.fn<LatticeIconRenderer>(({ icon }) => (
      <span data-testid={`icon-${icon}`} />
    ));

    render(
      <IconRendererProvider mode="replace" renderer={iconRenderer}>
        <LatticeSidebar
          sidebar={{
            groups: [
              {
                label: "Account",
                items: [
                  {
                    active: true,
                    href: "/settings",
                    icon: "settings",
                    key: "settings.edit",
                    label: "Settings",
                  },
                ],
              },
            ],
          }}
        />
      </IconRendererProvider>,
    );

    expect(screen.getByLabelText("Lattice sidebar")).toBeVisible();
    expect(screen.getByText("Account")).toBeVisible();
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByTestId("icon-settings")).toBeVisible();
  });

  it("does not render an empty navigation", () => {
    const { container } = render(<LatticeSidebar sidebar={{ groups: [] }} />);

    expect(container).toBeEmptyDOMElement();
  });
});

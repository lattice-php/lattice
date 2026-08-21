import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { LinkAdapter } from "./link-adapter";

describe("Lattice link component", () => {
  it("renders prefix and suffix affixes around the label", () => {
    const node = fakeNode({
      props: {
        href: "/docs",
        label: "Docs",
        prefix: { icon: "book-open", text: null },
        suffix: { icon: null, text: "new" },
      },
      type: "link",
    });

    render(<LinkAdapter node={node}>{null}</LinkAdapter>);

    const link = screen.getByRole("link", { name: "Docs new" });
    expect(link).toHaveAttribute("href", "/docs");
    expect(link.querySelector("svg")).not.toBeNull();
    expect(screen.getByText("new")).toBeVisible();
  });

  it("renders icon-only links with the label as their accessible name", () => {
    const node = fakeNode({
      props: {
        href: "/settings",
        icon: "settings",
        label: "Settings",
      },
      type: "link",
    });

    render(<LinkAdapter node={node}>{null}</LinkAdapter>);

    const link = screen.getByRole("link", { name: "Settings" });
    expect(link).toHaveAttribute("aria-label", "Settings");
    expect(link.querySelector("svg")).not.toBeNull();
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
  });
});

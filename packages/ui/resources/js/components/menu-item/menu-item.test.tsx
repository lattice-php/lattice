import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CollapsedProvider } from "@lattice-php/core/collapsed-context";
import { NavMenu } from "../menu/menu";
import { NavMenuItem } from "./menu-item";

describe("NavMenuItem", () => {
  it("renders a link with the active page marked and a button for click handlers", () => {
    const onClick = vi.fn();

    render(
      <NavMenu>
        <NavMenuItem active href="/products" label="Products" />
        <NavMenuItem label="Log out" onClick={onClick} />
      </NavMenu>,
    );

    expect(screen.getByRole("link", { name: "Products" })).toHaveAttribute("aria-current", "page");

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("toggles a nested group and reports the change", () => {
    const onOpenChange = vi.fn();

    render(
      <NavMenu>
        <NavMenuItem label="Account" onOpenChange={onOpenChange}>
          <NavMenuItem href="/profile" label="Profile" />
        </NavMenuItem>
      </NavMenu>,
    );

    expect(screen.queryByRole("link", { name: "Profile" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Account" }));

    expect(screen.getByRole("button", { name: "Account" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("link", { name: "Profile" })).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("keeps a controlled group at the given state", () => {
    render(
      <NavMenu>
        <NavMenuItem label="Account" open>
          <NavMenuItem href="/profile" label="Profile" />
        </NavMenuItem>
      </NavMenu>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Account" }));

    expect(screen.getByRole("link", { name: "Profile" })).toBeInTheDocument();
  });

  it("hides section headers and labels links by name while collapsed", () => {
    render(
      <CollapsedProvider collapsed>
        <NavMenu>
          <NavMenuItem label="Section" />
          <NavMenuItem href="/" label="Home" prefix={<span>H</span>} />
        </NavMenu>
      </CollapsedProvider>,
    );

    expect(screen.queryByText("Section")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-label", "Home");
    expect(screen.getByRole("tooltip")).toHaveTextContent("Home");
  });
});

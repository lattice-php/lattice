import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CollapsedProvider } from "@lattice-php/core/collapsed-context";
import { Menu } from "../menu/menu";
import { MenuItem } from "./menu-item";

describe("MenuItem", () => {
  it("renders a link with the active page marked and a button for click handlers", () => {
    const onClick = vi.fn();

    render(
      <Menu>
        <MenuItem active href="/products" label="Products" />
        <MenuItem label="Log out" onClick={onClick} />
      </Menu>,
    );

    expect(screen.getByRole("link", { name: "Products" })).toHaveAttribute("aria-current", "page");

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("toggles a nested group and reports the change", () => {
    const onOpenChange = vi.fn();

    render(
      <Menu>
        <MenuItem label="Account" onOpenChange={onOpenChange}>
          <MenuItem href="/profile" label="Profile" />
        </MenuItem>
      </Menu>,
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
      <Menu>
        <MenuItem label="Account" open>
          <MenuItem href="/profile" label="Profile" />
        </MenuItem>
      </Menu>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Account" }));

    expect(screen.getByRole("link", { name: "Profile" })).toBeInTheDocument();
  });

  it("hides section headers and labels links by name while collapsed", () => {
    render(
      <CollapsedProvider collapsed>
        <Menu>
          <MenuItem label="Section" />
          <MenuItem href="/" label="Home" prefix={<span>H</span>} />
        </Menu>
      </CollapsedProvider>,
    );

    expect(screen.queryByText("Section")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-label", "Home");
    expect(screen.getByRole("tooltip")).toHaveTextContent("Home");
  });
});

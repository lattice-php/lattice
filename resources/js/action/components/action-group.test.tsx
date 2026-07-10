import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import ActionGroupComponent from "./action-group";

describe("Lattice action group component", () => {
  it("opens a panel of grouped actions", () => {
    const node = fakeNode({
      id: "teams.members.2.actions",
      props: {
        label: "Manage member",
      },
      type: "action.group",
    });

    render(
      <ActionGroupComponent node={node}>
        <button type="button">Make admin</button>
        <button type="button">Remove</button>
      </ActionGroupComponent>,
    );

    expect(screen.queryByRole("button", { name: "Make admin" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Manage member" }));

    expect(screen.getByRole("menu", { name: "Manage member" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Make admin" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Remove" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Manage member" }));

    expect(screen.queryByRole("button", { name: "Make admin" })).not.toBeInTheDocument();
  });

  it("renders grouped actions inline when an orientation is configured", () => {
    const node = fakeNode({
      id: "locale-switcher",
      props: {
        label: "Language",
        orientation: "horizontal",
      },
      type: "action.group",
    });

    render(
      <ActionGroupComponent node={node}>
        <button type="button">English</button>
        <button type="button">German</button>
      </ActionGroupComponent>,
    );

    const group = screen.getByRole("group", { name: "Language" });

    expect(group).toHaveClass("inline-flex");
    expect(group).toHaveClass("flex-row");
    expect(screen.queryByRole("button", { name: "Language" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "English" })).toBeVisible();
    expect(screen.getByRole("button", { name: "German" })).toBeVisible();
  });

  it("renders inline action groups vertically", () => {
    const node = fakeNode({
      id: "locale-switcher",
      props: {
        label: "Language",
        orientation: "vertical",
      },
      type: "action.group",
    });

    render(
      <ActionGroupComponent node={node}>
        <button type="button">English</button>
        <button type="button">German</button>
      </ActionGroupComponent>,
    );

    expect(screen.getByRole("group", { name: "Language" })).toHaveClass("flex-col");
  });

  it("renders the localized default label when none is set", () => {
    const node = fakeNode({
      id: "row-actions",
      props: {},
      type: "action.group",
    });

    render(
      <ActionGroupComponent node={node}>
        <button type="button">Edit</button>
      </ActionGroupComponent>,
    );

    expect(screen.getByRole("button", { name: "Actions" })).toBeVisible();
  });
});

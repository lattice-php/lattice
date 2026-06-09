import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice/lattice/core/types";
import ActionGroupComponent from "./action-group";

describe("Lattice action group component", () => {
  it("opens a menu of grouped actions", () => {
    const node = {
      id: "teams.members.2.actions",
      props: {
        label: "Manage member",
      },
      type: "action.group",
    } satisfies Node<"action.group">;

    render(
      <ActionGroupComponent node={node}>
        <button type="button">Make admin</button>
        <button type="button">Remove</button>
      </ActionGroupComponent>,
    );

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Manage member" }));

    expect(screen.getByRole("menu", { name: "Manage member" })).toBeVisible();
    expect(screen.getByRole("menu", { name: "Manage member" })).toHaveClass("fixed");
    expect(screen.getByRole("button", { name: "Make admin" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Remove" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Manage member" }));

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});

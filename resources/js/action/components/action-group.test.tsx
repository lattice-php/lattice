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

    expect(screen.getByRole("dialog", { name: "Manage member" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Make admin" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Remove" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Manage member" }));

    expect(screen.queryByRole("button", { name: "Make admin" })).not.toBeInTheDocument();
  });
});

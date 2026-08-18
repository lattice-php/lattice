import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { renderWithModalHost } from "@lattice-php/ui/test/modal-host";
import ActionComponent from "./action";
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

    expect(screen.getByRole("group", { name: "Language" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Language" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "English" })).toBeVisible();
    expect(screen.getByRole("button", { name: "German" })).toBeVisible();
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

  it("keeps a confirm dialog usable after the kebab menu that opened it has closed", () => {
    const groupNode = fakeNode({
      id: "row.actions",
      props: { label: "Manage row" },
      type: "action.group",
    });
    const deleteAction = fakeNode({
      id: "row.delete",
      type: "action",
      props: {
        confirmation: {
          cancelLabel: "Cancel",
          confirmLabel: "Confirm delete",
          description: null,
          title: "Delete row?",
        },
        endpoint: "/lattice/actions/row.delete",
        label: "Delete",
        method: "delete",
      },
    });

    renderWithModalHost(
      <ActionGroupComponent node={groupNode}>
        <ActionComponent node={deleteAction}>{null}</ActionComponent>
      </ActionGroupComponent>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Manage row" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    const dialog = screen.getByRole("dialog", { name: "Delete row?" });
    expect(dialog).toBeVisible();

    // Opening the confirm dialog dismisses the popover it was clicked from,
    // unmounting its own opener button — the host's isConnected guard covers
    // exactly this case when the dialog later exits.
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Delete row?" })).toBeVisible();

    expect(() =>
      fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" })),
    ).not.toThrow();

    expect(screen.queryByRole("dialog", { name: "Delete row?" })).not.toBeInTheDocument();
  });
});

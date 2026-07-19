import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActionInteractionProvider } from "@lattice-php/lattice/action";
import { fakeNode } from "@lattice-php/lattice/test-support";
import type { Node, ComponentPropsOf } from "@lattice-php/lattice/core/types";
import MenuItemComponent from "./menu-item";

const apiFetch = vi.hoisted(() => vi.fn<() => Promise<Response>>());

vi.mock("@lattice-php/lattice/core/api", () => ({ apiFetch }));

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/lattice/test/inertia-mock")).inertiaMock({
    usePage: () => ({ url: "/products" }),
  }),
);

function actionMenuItem(props: Partial<ComponentPropsOf<"action">> = {}): Node<"menu-item"> {
  return fakeNode({
    id: "log-out",
    type: "menu-item",
    props: {
      label: "Log out",
      action: fakeNode({
        id: "workbench.logout",
        type: "action",
        props: {
          endpoint: "/lattice/actions/workbench.logout",
          label: "Log out",
          method: "post",
          ref: "sealed-reference",
          ...props,
        },
      }),
    },
  });
}

function renderActionMenuItem(node: Node<"menu-item">) {
  return render(
    <ActionInteractionProvider>
      <MenuItemComponent node={node}>{null}</MenuItemComponent>
    </ActionInteractionProvider>,
  );
}

describe("menu item action trigger", () => {
  beforeEach(() => {
    apiFetch.mockReset();
    apiFetch.mockResolvedValue(new Response(JSON.stringify({ effects: [] }), { status: 200 }));
  });

  it("dispatches the nested action with the ref header", async () => {
    renderActionMenuItem(actionMenuItem());

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith("/lattice/actions/workbench.logout", {
        method: "post",
        ref: "sealed-reference",
        throwOnError: false,
      });
    });
  });

  it("runs effects from the action response", async () => {
    apiFetch.mockResolvedValue(
      new Response(JSON.stringify({ effects: [{ message: "Signed out.", type: "toast" }] }), {
        status: 200,
      }),
    );

    const toastListener = vi.fn<(event: Event) => void>();
    window.addEventListener("lattice:toast", toastListener);

    renderActionMenuItem(actionMenuItem());

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(toastListener).toHaveBeenCalledTimes(1);
    });

    window.removeEventListener("lattice:toast", toastListener);
  });

  it("confirms before dispatching when the action requires confirmation", async () => {
    const node = actionMenuItem({
      confirmation: {
        cancelLabel: "Stay",
        confirmLabel: "Log out",
        description: "End your session?",
        title: "Log out?",
      },
    });

    renderActionMenuItem(node);

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(apiFetch).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog", { name: "Log out?" });
    expect(dialog).toBeVisible();

    fireEvent.click(within(dialog).getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledTimes(1);
    });
  });

  it("opens the modal form when the action carries one", () => {
    const node = actionMenuItem({
      form: fakeNode({ id: "reason-form", type: "form", props: {}, schema: [] }),
    });

    renderActionMenuItem(node);

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(apiFetch).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeVisible();
  });
});

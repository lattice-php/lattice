import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActionInteractionProvider } from "@lattice-php/action";
import { fakeNode } from "@lattice-php/core/test-support";
import type { Node, ComponentPropsOf } from "@lattice-php/core/types";
import MenuItemComponent from "./menu-item";

const apiFetch = vi.hoisted(() => vi.fn<() => Promise<Response>>());

vi.mock("@lattice-php/core/api", () => ({ apiFetch }));

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock({
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
});

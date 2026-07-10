import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActionInteractionProvider } from "@lattice-php/lattice/action";
import { fakeNode } from "@lattice-php/lattice/test-support";
import type { Node } from "@lattice-php/lattice/core/types";
import MenuItemComponent from "./menu-item";

const http = vi.hoisted(() => ({
  delete: vi.fn<(url: string, data?: Record<string, unknown>) => Promise<unknown>>(),
  patch: vi.fn<(url: string, data?: Record<string, unknown>) => Promise<unknown>>(),
  post: vi.fn<(url: string, data?: Record<string, unknown>) => Promise<unknown>>(),
  processing: false,
  put: vi.fn<(url: string, data?: Record<string, unknown>) => Promise<unknown>>(),
}));

vi.mock("@inertiajs/react", () => ({
  router: { reload: vi.fn<() => void>(), visit: vi.fn<(url: string) => void>() },
  useHttp: () => http,
  usePage: vi.fn<() => { url: string }>(() => ({ url: "/products" })),
  Link: ({ children, ...rest }: { children: React.ReactNode }) => <a {...rest}>{children}</a>,
}));

function actionMenuItem(props: Record<string, unknown> = {}): Node<"menu-item"> {
  return fakeNode({
    id: "log-out",
    type: "menu-item",
    props: {
      label: "Log out",
      action: {
        id: "workbench.logout",
        type: "action",
        props: {
          endpoint: "/lattice/actions/workbench.logout",
          label: "Log out",
          method: "post",
          ref: "sealed-reference",
          ...props,
        },
      },
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
    http.delete.mockReset();
    http.patch.mockReset();
    http.post.mockReset();
    http.put.mockReset();
    http.processing = false;
  });

  it("dispatches the nested action with the ref header", async () => {
    http.post.mockResolvedValue({ ok: true, effects: [] });

    renderActionMenuItem(actionMenuItem());

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith("/lattice/actions/workbench.logout", {
        headers: { "Accept-Language": "en", "X-Lattice-Ref": "sealed-reference" },
      });
    });
  });

  it("runs effects from the action response", async () => {
    http.post.mockResolvedValue({
      ok: true,
      effects: [{ message: "Signed out.", type: "toast" }],
    });

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
    http.post.mockResolvedValue({ ok: true, effects: [] });

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

    expect(http.post).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog", { name: "Log out?" });
    expect(dialog).toBeVisible();

    fireEvent.click(within(dialog).getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledTimes(1);
    });
  });

  it("opens the modal form when the action carries one", () => {
    const node = actionMenuItem({
      form: { id: "reason-form", type: "form", props: {}, schema: [] },
    });

    renderActionMenuItem(node);

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(http.post).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeVisible();
  });
});

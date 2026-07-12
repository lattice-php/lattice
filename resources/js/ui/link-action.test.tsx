import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActionInteractionProvider } from "@lattice-php/lattice/action";
import { fakeNode } from "@lattice-php/lattice/test-support";
import type { Node, PropsOf } from "@lattice-php/lattice/core/types";
import LinkComponent from "./link";

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
  Link: ({ children, ...rest }: { children: React.ReactNode }) => <a {...rest}>{children}</a>,
}));

function actionLink(props: Partial<PropsOf<"action">> = {}): Node<"link"> {
  return fakeNode({
    id: "log-out",
    type: "link",
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

function renderActionLink(node: Node<"link">) {
  return render(
    <ActionInteractionProvider>
      <LinkComponent node={node}>{null}</LinkComponent>
    </ActionInteractionProvider>,
  );
}

describe("link action trigger", () => {
  beforeEach(() => {
    http.delete.mockReset();
    http.patch.mockReset();
    http.post.mockReset();
    http.put.mockReset();
    http.processing = false;
  });

  it("dispatches the nested action with the ref header", async () => {
    http.post.mockResolvedValue({ ok: true, effects: [] });

    renderActionLink(actionLink());

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith("/lattice/actions/workbench.logout", {
        headers: { "Accept-Language": "en", "X-Lattice-Ref": "sealed-reference" },
      });
    });
  });

  it("confirms before dispatching when the action requires confirmation", async () => {
    http.post.mockResolvedValue({ ok: true, effects: [] });

    const node = actionLink({
      confirmation: {
        cancelLabel: "Stay",
        confirmLabel: "Log out",
        description: "End your session?",
        title: "Log out?",
      },
    });

    renderActionLink(node);

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
    const node = actionLink({
      form: fakeNode({ id: "reason-form", type: "form", props: {}, schema: [] }),
    });

    renderActionLink(node);

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(http.post).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeVisible();
  });
});

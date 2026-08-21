import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActionInteractionProvider } from "@lattice-php/action";
import { fakeNode, jsonResponse } from "@lattice-php/core/test-support";
import type { Node, ComponentPropsOf } from "@lattice-php/core/types";
import { ModalProvider } from "../modal/modal-host";
import LinkAdapter from "./link-adapter";

const apiFetch = vi.hoisted(() => vi.fn<() => Promise<Response>>());

vi.mock("@lattice-php/core/api", () => ({ apiFetch }));

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock(),
);

function actionLink(props: Partial<ComponentPropsOf<"action">> = {}): Node<"link"> {
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
    <ModalProvider>
      <ActionInteractionProvider>
        <LinkAdapter node={node}>{null}</LinkAdapter>
      </ActionInteractionProvider>
    </ModalProvider>,
  );
}

describe("link action trigger", () => {
  beforeEach(() => {
    apiFetch.mockReset();
    apiFetch.mockResolvedValue(jsonResponse({ effects: [] }));
  });

  it("dispatches the nested action with the ref header", async () => {
    renderActionLink(actionLink());

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith("/lattice/actions/workbench.logout", {
        method: "post",
        ref: "sealed-reference",
        throwOnError: false,
      });
    });
  });

  it("opens the modal form when the action carries one", () => {
    const node = actionLink({
      form: fakeNode({ id: "reason-form", type: "form", props: {}, schema: [] }),
    });

    renderActionLink(node);

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(apiFetch).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeVisible();
  });
});

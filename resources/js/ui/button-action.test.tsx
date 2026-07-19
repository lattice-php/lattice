import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActionInteractionProvider } from "@lattice-php/lattice/action";
import { fakeNode } from "@lattice-php/lattice/test-support";
import type { Node, ComponentPropsOf } from "@lattice-php/lattice/core/types";
import ButtonComponent from "./button";

const apiFetch = vi.hoisted(() => vi.fn<() => Promise<Response>>());

vi.mock("@lattice-php/lattice/core/api", () => ({ apiFetch }));

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/lattice/test/inertia-mock")).inertiaMock(),
);

function actionButton(props: Partial<ComponentPropsOf<"action">> = {}): Node<"button"> {
  return fakeNode({
    id: "save",
    type: "button",
    props: {
      label: "Save",
      buttonType: "button",
      action: fakeNode({
        id: "workbench.save",
        type: "action",
        props: {
          endpoint: "/lattice/actions/workbench.save",
          label: "Save",
          method: "post",
          ref: "sealed-reference",
          ...props,
        },
      }),
    },
  });
}

function renderActionButton(node: Node<"button">) {
  return render(
    <ActionInteractionProvider>
      <ButtonComponent node={node}>{null}</ButtonComponent>
    </ActionInteractionProvider>,
  );
}

describe("button action trigger", () => {
  beforeEach(() => {
    apiFetch.mockReset();
    apiFetch.mockResolvedValue(new Response(JSON.stringify({ effects: [] }), { status: 200 }));
  });

  it("dispatches its nested action with the ref header on click", async () => {
    renderActionButton(actionButton());

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith("/lattice/actions/workbench.save", {
        method: "post",
        ref: "sealed-reference",
        throwOnError: false,
      });
    });
  });

  it("confirms before dispatching when the action requires confirmation", async () => {
    const node = actionButton({
      confirmation: {
        cancelLabel: "Cancel",
        confirmLabel: "Save",
        description: "Persist the changes?",
        title: "Save changes?",
      },
    });

    renderActionButton(node);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(apiFetch).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog", { name: "Save changes?" });

    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledTimes(1);
    });
  });
});

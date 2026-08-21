import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActionInteractionProvider } from "@lattice-php/action";
import { fakeNode, jsonResponse } from "@lattice-php/core/test-support";
import type { Node, ComponentPropsOf } from "@lattice-php/core/types";
import { ModalProvider } from "../modal/modal-host";
import { ButtonAdapter } from "./button-adapter";

const apiFetch = vi.hoisted(() => vi.fn<() => Promise<Response>>());

vi.mock("@lattice-php/core/api", () => ({ apiFetch }));

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock(),
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
    <ModalProvider>
      <ActionInteractionProvider>
        <ButtonAdapter node={node}>{null}</ButtonAdapter>
      </ActionInteractionProvider>
    </ModalProvider>,
  );
}

describe("button action trigger", () => {
  beforeEach(() => {
    apiFetch.mockReset();
    apiFetch.mockResolvedValue(jsonResponse({ effects: [] }));
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

  it("rejects a nested component that is not an action", () => {
    const node = fakeNode({
      id: "broken",
      type: "button",
      props: {
        action: fakeNode({ id: "card", type: "card", props: {} }),
        buttonType: "button",
        label: "Broken",
      },
    });

    expect(() => renderActionButton(node)).toThrow(
      "Clickable action nodes must have type [action] or [action.bulk].",
    );
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

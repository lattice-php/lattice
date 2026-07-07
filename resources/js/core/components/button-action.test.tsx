import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import type { Node } from "@lattice-php/lattice/core/types";
import ButtonComponent from "./button";

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

function actionButton(props: Record<string, unknown> = {}): Node<"button"> {
  return fakeNode({
    id: "save",
    type: "button",
    props: {
      label: "Save",
      buttonType: "button",
      action: {
        id: "workbench.save",
        type: "action",
        props: {
          endpoint: "/lattice/actions/workbench.save",
          label: "Save",
          method: "post",
          ref: "sealed-reference",
          ...props,
        },
      },
    },
  });
}

describe("button action trigger", () => {
  beforeEach(() => {
    http.post.mockReset();
    http.processing = false;
  });

  it("dispatches its nested action with the ref header on click", async () => {
    http.post.mockResolvedValue({ ok: true, effects: [] });

    render(<ButtonComponent node={actionButton()}>{null}</ButtonComponent>);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith("/lattice/actions/workbench.save", {
        headers: { "Accept-Language": "en", "X-Lattice-Ref": "sealed-reference" },
      });
    });
  });

  it("confirms before dispatching when the action requires confirmation", async () => {
    http.post.mockResolvedValue({ ok: true, effects: [] });

    const node = actionButton({
      confirmation: {
        cancelLabel: "Cancel",
        confirmLabel: "Save",
        description: "Persist the changes?",
        title: "Save changes?",
      },
    });

    render(<ButtonComponent node={node}>{null}</ButtonComponent>);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(http.post).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog", { name: "Save changes?" });

    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledTimes(1);
    });
  });
});

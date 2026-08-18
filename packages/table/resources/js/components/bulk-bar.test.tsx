import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ActionResponse } from "@lattice-php/ui/effects/dispatch";
import type { EffectHandler } from "@lattice-php/ui/effects/registry";
import { createRegistry } from "@lattice-php/core/registry";
import { Provider } from "@lattice-php/lattice/provider";
import { fakeNode } from "@lattice-php/core/test-support";
import type { Node } from "@lattice-php/core/types";
import { BulkBar } from "./bulk-bar";

const apiFetch = vi.hoisted(() =>
  vi.fn<(url: string, init?: Record<string, unknown>) => Promise<Response>>(),
);

vi.mock("@lattice-php/core/api", () => ({ apiFetch }));

const router = vi.hoisted(() => ({
  on: vi.fn<(event: string, listener: (event: Event) => void) => () => void>(() =>
    vi.fn<() => void>(),
  ),
  reload: vi.fn<() => void>(),
  visit: vi.fn<(url: string) => void>(),
}));

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock({ router }),
);

type ActionFormProps = {
  cancelLabel: string;
  description?: string;
  extraData: Record<string, unknown>;
  submitLabel: string;
  title: string;
  onClose: () => void;
  onExited?: (event: Event) => void;
  onSuccess: (response: ActionResponse) => void;
};

vi.mock("@lattice-php/form/action-form", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@lattice-php/form/action-form")>();

  return {
    ...actual,
    // Stands in for the real Dialog/DialogContent: the host only removes the
    // entry once `onExited` fires (Radix's onCloseAutoFocus), so this mock
    // fires it itself right after closing/succeeding to mimic an instant
    // (no-animation) exit, matching what jsdom would otherwise never trigger.
    ActionForm: (props: ActionFormProps) => (
      <div data-test="action-form">
        <span data-test="form-title">{props.title}</span>
        <span data-test="form-description">{props.description ?? "(none)"}</span>
        <span data-test="form-cancel-label">{props.cancelLabel}</span>
        <span data-test="form-submit-label">{props.submitLabel}</span>
        <span data-test="form-extra">{JSON.stringify(props.extraData)}</span>
        <button
          type="button"
          data-test="form-success"
          onClick={() => {
            props.onSuccess({ effects: [{ type: "test.bulk-success", props: {} }] });
            props.onExited?.(new Event("mock-exit"));
          }}
        >
          success
        </button>
        <button
          type="button"
          data-test="form-close"
          onClick={() => {
            props.onClose();
            props.onExited?.(new Event("mock-exit"));
          }}
        >
          close
        </button>
      </div>
    ),
  };
});

function action(
  partial: Partial<Record<string, unknown>> & { id: string },
): Node<"action" | "action.bulk"> {
  const { id, ...props } = partial;

  return fakeNode({
    id,
    type: "action.bulk",
    props: {
      label: "Run",
      method: "post",
      endpoint: "/bulk/run",
      ref: "",
      variant: null,
      emphasis: "solid",
      confirmation: null,
      form: null,
      lazyForm: false,
      modalSide: null,
      modalWidth: null,
      ...props,
    },
  });
}

const effectHandler = vi.fn<EffectHandler>();
const registry = createRegistry({
  name: "bulk-bar-test",
  extensions: {
    effects: {
      "test.bulk-success": effectHandler,
    },
  },
});

function renderBar(props: Partial<Parameters<typeof BulkBar>[0]> = {}) {
  const onSelectAllMatching = vi.fn<() => void>();
  const onCompleted = vi.fn<() => void>();

  render(
    <Provider registry={registry} toaster={false}>
      <BulkBar
        actions={[action({ id: "archive" })]}
        selectedKeys={["1", "2"]}
        allMatching={false}
        query={{ filter: "status:eq:active" }}
        canSelectAllMatching={false}
        onSelectAllMatching={onSelectAllMatching}
        onCompleted={onCompleted}
        {...props}
      />
    </Provider>,
  );

  return { onSelectAllMatching, onCompleted };
}

describe("BulkBar", () => {
  beforeEach(() => {
    apiFetch.mockReset();
    apiFetch.mockResolvedValue(new Response(JSON.stringify({ effects: [] }), { status: 200 }));
  });

  afterEach(() => {
    router.on.mockClear();
    router.reload.mockClear();
    router.visit.mockClear();
    effectHandler.mockClear();
  });

  it.each([
    ["selected keys", { selectedKeys: ["1", "2", "3"] }, "3 selected"],
    ["all matching rows", { allMatching: true, total: 42, selectedKeys: ["1"] }, "All 42 selected"],
    [
      "selected keys when the total is absent",
      { allMatching: true, selectedKeys: ["1", "2"] },
      "All 2 selected",
    ],
  ])("shows the count for %s", (_case, props, expected) => {
    renderBar(props);

    expect(screen.getByText(expected)).toBeVisible();
  });

  it("renders and fires the select-all-matching button when allowed", () => {
    const { onSelectAllMatching } = renderBar({ canSelectAllMatching: true, total: 50 });

    const button = screen.getByTestId("bulk-select-all-matching");
    expect(button).toHaveTextContent("Select all 50 matching");

    fireEvent.click(button);

    expect(onSelectAllMatching).toHaveBeenCalledTimes(1);
  });

  it("submits a plain action with the selected keys payload", async () => {
    const { onCompleted } = renderBar({
      actions: [action({ id: "archive", method: "patch", endpoint: "/bulk/archive" })],
      selectedKeys: ["7"],
    });

    fireEvent.click(screen.getByTestId("bulk-action-archive"));

    await waitFor(() => expect(apiFetch).toHaveBeenCalledWith("/bulk/archive", expect.anything()));
    const [, options] = apiFetch.mock.calls[0] as [string, { body: string }];
    expect(JSON.parse(options.body)).toEqual({ selected: ["7"] });
    await waitFor(() => expect(onCompleted).toHaveBeenCalledTimes(1));
  });

  it("sends an empty ref header when the action has no ref", async () => {
    renderBar({
      actions: [
        action({
          id: "archive",
          method: "patch",
          endpoint: "/bulk/archive",
          // "" is the real normalized "no ref" value: getBulkActionNodes never
          // rewrites the raw node, so this is an in-contract fixture.
          ref: "",
        }),
      ],
    });

    fireEvent.click(screen.getByTestId("bulk-action-archive"));

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    const [, options] = apiFetch.mock.calls[0] as [string, { ref: string }];
    expect(options.ref).toBe("");
  });

  it("submits all-matching actions with the query payload", async () => {
    const { onCompleted } = renderBar({
      allMatching: true,
      query: { filter: "status:eq:active", tf: { featured: "true" } },
      actions: [action({ id: "archive" })],
    });

    fireEvent.click(screen.getByTestId("bulk-action-archive"));

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    const [, options] = apiFetch.mock.calls[0] as [string, { body: string }];
    expect(JSON.parse(options.body)).toEqual({
      allMatching: true,
      filter: "status:eq:active",
      tf: { featured: "true" },
    });
    await waitFor(() => expect(onCompleted).toHaveBeenCalledTimes(1));
  });

  it("does not complete when the request fails", async () => {
    const actionError = vi.fn<(event: Event) => void>();
    apiFetch.mockRejectedValueOnce(new Error("failed"));
    window.addEventListener("lattice:action-error", actionError, { once: true });
    const { onCompleted } = renderBar({ actions: [action({ id: "archive" })] });

    fireEvent.click(screen.getByTestId("bulk-action-archive"));

    await waitFor(() => expect(actionError).toHaveBeenCalledTimes(1));
    expect(onCompleted).not.toHaveBeenCalled();
  });

  it("tracks processing per trigger, leaving other actions clickable", async () => {
    apiFetch.mockReturnValue(new Promise<Response>(() => {}));
    renderBar({
      actions: [action({ id: "archive" }), action({ id: "restore", label: "Restore" })],
    });

    fireEvent.click(screen.getByTestId("bulk-action-archive"));

    await waitFor(() => {
      expect(screen.getByTestId("bulk-action-archive")).toBeDisabled();
    });
    expect(screen.getByTestId("bulk-action-restore")).not.toBeDisabled();
  });

  describe("confirmation flow", () => {
    it("opens a confirm dialog with explicit confirmation values", () => {
      renderBar({
        actions: [
          action({
            id: "archive",
            label: "Archive",
            confirmation: {
              title: "Archive items?",
              description: "This cannot be undone.",
              confirmLabel: "Yes archive",
              cancelLabel: "No",
            },
          }),
        ],
      });

      fireEvent.click(screen.getByTestId("bulk-action-archive"));

      const dialog = screen.getByRole("dialog", { name: "Archive items?" });
      expect(within(dialog).getByText("This cannot be undone.")).toBeVisible();
      expect(within(dialog).getByRole("button", { name: "Yes archive" })).toBeVisible();
      expect(within(dialog).getByRole("button", { name: "No" })).toBeVisible();
    });

    it("falls back to the action label and defaults when confirmation fields are missing", () => {
      renderBar({
        actions: [
          action({
            id: "archive",
            label: "Archive",
            confirmation: {
              // Confirmation.title is nullable by contract: a title-less
              // confirmation falls back to the action's label.
              title: null,
              description: null,
              confirmLabel: null,
              cancelLabel: null,
            },
          }),
        ],
      });

      fireEvent.click(screen.getByTestId("bulk-action-archive"));

      const dialog = screen.getByRole("dialog", { name: "Archive" });
      expect(within(dialog).getByRole("button", { name: "Archive" })).toBeVisible();
      expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeVisible();
      expect(within(dialog).queryByText("(none)")).toBeNull();
    });

    it("submits and closes when the confirmation is accepted", async () => {
      const { onCompleted } = renderBar({
        actions: [
          action({
            id: "archive",
            confirmation: {
              title: "Sure?",
              description: null,
              confirmLabel: null,
              cancelLabel: null,
            },
          }),
        ],
      });

      fireEvent.click(screen.getByTestId("bulk-action-archive"));
      fireEvent.click(screen.getByTestId("confirm-accept"));

      await waitFor(() => expect(onCompleted).toHaveBeenCalledTimes(1));
      await waitFor(() =>
        expect(screen.queryByRole("dialog", { name: "Sure?" })).not.toBeInTheDocument(),
      );
    });

    it("dispatches effects, keeps the dialog open, and does not complete when the request is rejected with 422", async () => {
      apiFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ effects: [{ type: "test.bulk-success" }] }), {
          status: 422,
        }),
      );

      const { onCompleted } = renderBar({
        actions: [
          action({
            id: "archive",
            confirmation: {
              title: "Sure?",
              description: null,
              confirmLabel: null,
              cancelLabel: null,
            },
          }),
        ],
      });

      fireEvent.click(screen.getByTestId("bulk-action-archive"));
      fireEvent.click(screen.getByTestId("confirm-accept"));

      await waitFor(() => expect(effectHandler).toHaveBeenCalledTimes(1));

      expect(screen.getByRole("dialog", { name: "Sure?" })).toBeVisible();
      expect(onCompleted).not.toHaveBeenCalled();
    });

    it("closes without submitting when the confirmation is cancelled", () => {
      const { onCompleted } = renderBar({
        actions: [
          action({
            id: "archive",
            confirmation: {
              title: "Sure?",
              description: null,
              confirmLabel: null,
              cancelLabel: null,
            },
          }),
        ],
      });

      fireEvent.click(screen.getByTestId("bulk-action-archive"));
      fireEvent.click(screen.getByTestId("confirm-cancel"));

      expect(screen.queryByRole("dialog", { name: "Sure?" })).not.toBeInTheDocument();
      expect(onCompleted).not.toHaveBeenCalled();
    });
  });

  describe("form flow", () => {
    const formNode = fakeNode({ type: "form", schema: [] });

    it("opens the action form with explicit confirmation labels and the selection payload", () => {
      renderBar({
        allMatching: false,
        selectedKeys: ["9"],
        actions: [
          action({
            id: "tag",
            label: "Tag",
            form: formNode,
            confirmation: {
              title: "Tag form",
              description: "Pick a tag",
              confirmLabel: "Apply",
              cancelLabel: "Dismiss",
            },
          }),
        ],
      });

      fireEvent.click(screen.getByTestId("bulk-action-tag"));

      expect(screen.getByTestId("form-title")).toHaveTextContent("Tag form");
      expect(screen.getByTestId("form-description")).toHaveTextContent("Pick a tag");
      expect(screen.getByTestId("form-submit-label")).toHaveTextContent("Apply");
      expect(screen.getByTestId("form-cancel-label")).toHaveTextContent("Dismiss");
      expect(screen.getByTestId("form-extra")).toHaveTextContent(
        JSON.stringify({ selected: ["9"] }),
      );
    });

    it("falls back to the action label and defaults when the form has no confirmation", () => {
      renderBar({
        actions: [action({ id: "tag", label: "Tag", form: formNode, confirmation: null })],
      });

      fireEvent.click(screen.getByTestId("bulk-action-tag"));

      expect(screen.getByTestId("form-title")).toHaveTextContent("Tag");
      expect(screen.getByTestId("form-description")).toHaveTextContent("(none)");
      expect(screen.getByTestId("form-submit-label")).toHaveTextContent("Tag");
      expect(screen.getByTestId("form-cancel-label")).toHaveTextContent("Cancel");
    });

    it("closes and completes on form success without re-dispatching effects", async () => {
      const { onCompleted } = renderBar({
        actions: [action({ id: "tag", form: formNode, confirmation: null })],
      });

      fireEvent.click(screen.getByTestId("bulk-action-tag"));
      fireEvent.click(screen.getByTestId("form-success"));

      await waitFor(() => expect(onCompleted).toHaveBeenCalledTimes(1));
      expect(screen.queryByTestId("action-form")).toBeNull();
      expect(effectHandler).not.toHaveBeenCalled();
    });

    it("closes the form without completing on cancel", () => {
      const { onCompleted } = renderBar({
        actions: [action({ id: "tag", form: formNode, confirmation: null })],
      });

      fireEvent.click(screen.getByTestId("bulk-action-tag"));
      fireEvent.click(screen.getByTestId("form-close"));

      expect(screen.queryByTestId("action-form")).toBeNull();
      expect(onCompleted).not.toHaveBeenCalled();
    });

    it("uses the all-matching payload as the form extra data", () => {
      renderBar({
        allMatching: true,
        query: { filter: "status:eq:active" },
        actions: [action({ id: "tag", form: formNode, confirmation: null })],
      });

      fireEvent.click(screen.getByTestId("bulk-action-tag"));

      expect(screen.getByTestId("form-extra")).toHaveTextContent(
        JSON.stringify({ allMatching: true, filter: "status:eq:active" }),
      );
    });

    it("opens a lazy bulk action form and posts the selection payload with the schema request", async () => {
      renderBar({
        selectedKeys: ["9"],
        actions: [
          action({ id: "tag", label: "Tag", lazyForm: true, form: null, confirmation: null }),
        ],
      });

      fireEvent.click(screen.getByTestId("bulk-action-tag"));

      await waitFor(() => expect(screen.getByTestId("action-form")).toBeInTheDocument());

      const schemaCall = apiFetch.mock.calls.find(([, options]) => {
        const body = JSON.parse((options as { body: string }).body) as Record<string, unknown>;

        return body._sub === "schema";
      });

      expect(schemaCall).toBeDefined();
      const [, options] = schemaCall as [string, { body: string }];
      expect(JSON.parse(options.body)).toEqual({ _sub: "schema", selected: ["9"] });
    });
  });
});

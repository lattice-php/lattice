import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ActionResponse } from "@lattice-php/lattice/effects/dispatch";
import type { EffectHandler } from "@lattice-php/lattice/effects/registry";
import { createPlugin, createRegistry } from "@lattice-php/lattice/core/registry";
import { Provider } from "@lattice-php/lattice/provider";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { BulkBar } from "./bulk-bar";
import type { BulkAction } from "../bulk";

const http = vi.hoisted(() => ({
  processing: false,
  transformer: (data: Record<string, unknown>): Record<string, unknown> => data,
  transform(fn: (data: Record<string, unknown>) => Record<string, unknown>): void {
    this.transformer = fn;
  },
  patch: vi.fn<(url: string, options: unknown) => Promise<ActionResponse>>(async () => ({
    effects: [],
  })),
  post: vi.fn<(url: string, options: unknown) => Promise<ActionResponse>>(async () => ({
    effects: [],
  })),
}));

const router = vi.hoisted(() => ({
  on: vi.fn<(event: string, listener: (event: Event) => void) => () => void>(() =>
    vi.fn<() => void>(),
  ),
  reload: vi.fn<() => void>(),
  visit: vi.fn<(url: string) => void>(),
}));

vi.mock("@inertiajs/react", () => ({
  router,
  useHttp: () => http,
}));

type ActionFormProps = {
  cancelLabel: string;
  description?: string;
  extraData: Record<string, unknown>;
  submitLabel: string;
  title: string;
  onClose: () => void;
  onSuccess: (response: ActionResponse) => void;
};

vi.mock("@lattice-php/lattice/action/components/action-form", () => ({
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
        onClick={() => props.onSuccess({ effects: [{ type: "test.bulk-success" } as never] })}
      >
        success
      </button>
      <button type="button" data-test="form-close" onClick={props.onClose}>
        close
      </button>
    </div>
  ),
}));

function action(partial: Partial<BulkAction> & Pick<BulkAction, "id">): BulkAction {
  return {
    label: "Run",
    method: "post",
    endpoint: "/bulk/run",
    ref: "",
    variant: "default",
    confirmation: null,
    form: null,
    ...partial,
  };
}

const effectHandler = vi.fn<EffectHandler>();
const registry = createRegistry(
  createPlugin({
    name: "bulk-bar-test",
    effects: {
      "test.bulk-success": effectHandler,
    },
  }),
);

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
    http.processing = false;
    http.transformer = (data: Record<string, unknown>): Record<string, unknown> => data;
  });

  afterEach(() => {
    http.patch.mockClear();
    http.post.mockClear();
    router.on.mockClear();
    router.reload.mockClear();
    router.visit.mockClear();
    effectHandler.mockClear();
  });

  it("shows the selected count when not selecting all matching", () => {
    renderBar({ selectedKeys: ["1", "2", "3"] });

    expect(screen.getByText("3 selected")).toBeVisible();
  });

  it("shows the all-selected count using total when selecting all matching", () => {
    renderBar({ allMatching: true, total: 42, selectedKeys: ["1"] });

    expect(screen.getByText("All 42 selected")).toBeVisible();
  });

  it("falls back to the selected length when total is missing for all matching", () => {
    renderBar({ allMatching: true, selectedKeys: ["1", "2"] });

    expect(screen.getByText("All 2 selected")).toBeVisible();
  });

  it("hides the select-all-matching button when it is not allowed", () => {
    renderBar({ canSelectAllMatching: false });

    expect(screen.queryByTestId("bulk-select-all-matching")).toBeNull();
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

    await waitFor(() =>
      expect(http.patch).toHaveBeenCalledWith("/bulk/archive", expect.anything()),
    );
    expect(http.transformer({})).toEqual({ selected: ["7"] });
    await waitFor(() => expect(onCompleted).toHaveBeenCalledTimes(1));
  });

  it("sends an empty ref header when the action has no ref", async () => {
    renderBar({
      actions: [
        action({ id: "archive", method: "patch", endpoint: "/bulk/archive", ref: null as never }),
      ],
    });

    fireEvent.click(screen.getByTestId("bulk-action-archive"));

    await waitFor(() => expect(http.patch).toHaveBeenCalled());
    const [, options] = http.patch.mock.calls[0] ?? [];
    expect((options as { headers: Record<string, string> }).headers).not.toHaveProperty(
      "X-Lattice-Ref",
    );
  });

  it("submits all-matching actions with the query payload", async () => {
    const { onCompleted } = renderBar({
      allMatching: true,
      query: { filter: "status:eq:active", tf: { featured: "true" } },
      actions: [action({ id: "archive" })],
    });

    fireEvent.click(screen.getByTestId("bulk-action-archive"));

    await waitFor(() => expect(http.post).toHaveBeenCalled());
    expect(http.transformer({})).toEqual({
      allMatching: true,
      filter: "status:eq:active",
      tf: { featured: "true" },
    });
    await waitFor(() => expect(onCompleted).toHaveBeenCalledTimes(1));
  });

  it("does not complete when the request fails", async () => {
    const actionError = vi.fn<(event: Event) => void>();
    http.post.mockRejectedValueOnce(new Error("failed"));
    window.addEventListener("lattice:action-error", actionError, { once: true });
    const { onCompleted } = renderBar({ actions: [action({ id: "archive" })] });

    fireEvent.click(screen.getByTestId("bulk-action-archive"));

    await waitFor(() => expect(actionError).toHaveBeenCalledTimes(1));
    expect(onCompleted).not.toHaveBeenCalled();
  });

  it("disables the action buttons and shows a spinner while processing", () => {
    http.processing = true;
    renderBar({ actions: [action({ id: "archive" })] });

    expect(screen.getByTestId("bulk-action-archive")).toBeDisabled();
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
              title: null,
              description: null,
              confirmLabel: null,
              cancelLabel: null,
            } as never,
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

    it("dispatches effects, closes and completes on form success", async () => {
      const { onCompleted } = renderBar({
        actions: [action({ id: "tag", form: formNode, confirmation: null })],
      });

      fireEvent.click(screen.getByTestId("bulk-action-tag"));
      fireEvent.click(screen.getByTestId("form-success"));

      expect(effectHandler).toHaveBeenCalledWith({ type: "test.bulk-success" });
      await waitFor(() => expect(onCompleted).toHaveBeenCalledTimes(1));
      expect(screen.queryByTestId("action-form")).toBeNull();
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
  });
});

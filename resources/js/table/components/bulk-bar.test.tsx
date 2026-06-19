import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ActionResponse } from "@lattice-php/lattice/effects/dispatch";
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

vi.mock("@inertiajs/react", () => ({
  useHttp: () => http,
}));

const runAction = vi.hoisted(() =>
  vi.fn<(request: () => Promise<ActionResponse>, dispatch: unknown) => Promise<boolean>>(
    async (request) => {
      await request();

      return true;
    },
  ),
);

vi.mock("@lattice-php/lattice/action/run-action", () => ({
  runAction,
}));

const dispatch = vi.hoisted(() => vi.fn<(effects: unknown) => void>());

vi.mock("@lattice-php/lattice/effects/use-effect-dispatcher", () => ({
  useEffectDispatcher: () => dispatch,
}));

const getActionEffects = vi.hoisted(() =>
  vi.fn<(effects: unknown) => unknown>((effects) => effects),
);

vi.mock("@lattice-php/lattice/effects/dispatch", () => ({
  getActionEffects,
}));

type ConfirmProps = {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

vi.mock("@lattice-php/lattice/core/components/confirm-dialog", () => ({
  ConfirmDialog: (props: ConfirmProps) => (
    <div data-test="confirm-dialog">
      <span data-test="confirm-title">{props.title}</span>
      <span data-test="confirm-description">{props.description ?? "(none)"}</span>
      <span data-test="confirm-confirm-label">{props.confirmLabel}</span>
      <span data-test="confirm-cancel-label">{props.cancelLabel}</span>
      <button type="button" data-test="confirm-accept" onClick={props.onConfirm}>
        accept
      </button>
      <button type="button" data-test="confirm-cancel" onClick={props.onCancel}>
        cancel
      </button>
    </div>
  ),
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
        onClick={() => props.onSuccess({ effects: [{ type: "reloadPage" }] })}
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

function renderBar(props: Partial<Parameters<typeof BulkBar>[0]> = {}) {
  const onSelectAllMatching = vi.fn<() => void>();
  const onCompleted = vi.fn<() => void>();

  render(
    <BulkBar
      actions={[action({ id: "archive" })]}
      selectedKeys={["1", "2"]}
      allMatching={false}
      query={{ filter: "status:eq:active" }}
      canSelectAllMatching={false}
      onSelectAllMatching={onSelectAllMatching}
      onCompleted={onCompleted}
      {...props}
    />,
  );

  return { onSelectAllMatching, onCompleted };
}

describe("BulkBar", () => {
  beforeEach(() => {
    http.processing = false;
  });

  afterEach(() => {
    http.patch.mockClear();
    http.post.mockClear();
    runAction.mockClear();
    dispatch.mockClear();
    getActionEffects.mockClear();
    runAction.mockImplementation(async (request) => {
      await request();

      return true;
    });
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
    runAction.mockImplementation(async () => false);
    const { onCompleted } = renderBar({ actions: [action({ id: "archive" })] });

    fireEvent.click(screen.getByTestId("bulk-action-archive"));

    await waitFor(() => expect(runAction).toHaveBeenCalled());
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

      expect(screen.getByTestId("confirm-title")).toHaveTextContent("Archive items?");
      expect(screen.getByTestId("confirm-description")).toHaveTextContent("This cannot be undone.");
      expect(screen.getByTestId("confirm-confirm-label")).toHaveTextContent("Yes archive");
      expect(screen.getByTestId("confirm-cancel-label")).toHaveTextContent("No");
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

      expect(screen.getByTestId("confirm-title")).toHaveTextContent("Archive");
      expect(screen.getByTestId("confirm-description")).toHaveTextContent("(none)");
      expect(screen.getByTestId("confirm-confirm-label")).toHaveTextContent("Archive");
      expect(screen.getByTestId("confirm-cancel-label")).toHaveTextContent("Cancel");
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
      await waitFor(() => expect(screen.queryByTestId("confirm-dialog")).toBeNull());
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

      expect(screen.queryByTestId("confirm-dialog")).toBeNull();
      expect(onCompleted).not.toHaveBeenCalled();
    });
  });

  describe("form flow", () => {
    const formNode = { type: "form", schema: [] } as unknown as BulkAction["form"];

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

      expect(getActionEffects).toHaveBeenCalledWith([{ type: "reloadPage" }]);
      expect(dispatch).toHaveBeenCalledWith([{ type: "reloadPage" }]);
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

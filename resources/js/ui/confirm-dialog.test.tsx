import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "./confirm-dialog";

describe("ConfirmDialog", () => {
  it("renders the title and description and confirms", () => {
    const onConfirm = vi.fn<() => void>();
    render(
      <ConfirmDialog
        title="Delete account?"
        description="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Delete account?" })).toBeVisible();
    expect(screen.getByText("This cannot be undone.")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("cancels when dismissed via Escape", () => {
    const onCancel = vi.fn<() => void>();
    render(
      <ConfirmDialog
        title="Delete?"
        confirmLabel="Delete"
        onConfirm={() => {}}
        onCancel={onCancel}
      />,
    );

    fireEvent.keyDown(document.body, { key: "Escape" });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("blocks dismissal and disables the buttons while processing", () => {
    const onCancel = vi.fn<() => void>();
    render(
      <ConfirmDialog
        title="Delete?"
        confirmLabel="Delete"
        processing
        onConfirm={() => {}}
        onCancel={onCancel}
      />,
    );

    fireEvent.keyDown(document.body, { key: "Escape" });

    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByText("Delete").closest("button")).toBeDisabled();
  });
});

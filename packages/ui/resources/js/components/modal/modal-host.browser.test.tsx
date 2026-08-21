import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Dialog, DialogContent, DialogHeader } from "../../primitives/dialog";
import { ConfirmDialog } from "../../primitives/confirm-dialog";
import { ModalProvider, useEmbeddedModal, useModal } from "./modal-host";

function ConfirmB() {
  const context = useEmbeddedModal();

  if (!context) {
    return null;
  }

  return (
    <ConfirmDialog
      open={context.open}
      onExited={context.onExited}
      title="Confirm B"
      confirmLabel="Confirm"
      onCancel={() => context.onOpenChange(false)}
      onConfirm={() => context.onOpenChange(false)}
    />
  );
}

function DialogA() {
  const context = useEmbeddedModal();
  const host = useModal();

  if (!context) {
    return null;
  }

  return (
    <Dialog open={context.open} onOpenChange={context.onOpenChange}>
      <DialogContent onCloseAutoFocus={context.onExited}>
        <DialogHeader title="Dialog A" />
        <button onClick={() => host.open(<ConfirmB />)} type="button">
          Open B
        </button>
      </DialogContent>
    </Dialog>
  );
}

function PageTrigger() {
  const host = useModal();

  return (
    <button onClick={() => host.open(<DialogA />)} type="button">
      Open A
    </button>
  );
}

describe("nested modal focus restore in a browser", () => {
  it("restores focus down the stack as each nested dialog closes", async () => {
    const screen = await render(
      <ModalProvider>
        <PageTrigger />
      </ModalProvider>,
    );

    const pageOpener = screen.getByRole("button", { name: "Open A" });
    await pageOpener.click();

    await expect.element(screen.getByRole("dialog", { name: "Dialog A" })).toBeVisible();

    const openB = screen.getByRole("button", { name: "Open B" });
    await openB.click();

    await expect.element(screen.getByRole("dialog", { name: "Confirm B" })).toBeVisible();

    await screen.getByTestId("confirm-cancel").click();

    await expect.element(screen.getByRole("dialog", { name: "Confirm B" })).not.toBeInTheDocument();
    await expect.element(openB).toHaveFocus();

    await screen.getByTestId("dialog-close").click();

    await expect.element(screen.getByRole("dialog", { name: "Dialog A" })).not.toBeInTheDocument();
    await expect.element(pageOpener).toHaveFocus();
  });
});

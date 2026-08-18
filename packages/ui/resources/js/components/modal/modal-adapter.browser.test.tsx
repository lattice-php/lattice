import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { fakeNode } from "@lattice-php/core/test-support";
import { ModalProvider, useModal } from "../../modal";
import ModalAdapter from "./modal-adapter";

const registry = createRegistry({
  components: { modal: eagerComponent(ModalAdapter) },
  name: "test/modal",
});

function OpenButton() {
  const host = useModal();

  return (
    <button
      onClick={() =>
        host.open(fakeNode<"modal">({ type: "modal", id: "info", props: { title: "Info" } }))
      }
      type="button"
    >
      Open
    </button>
  );
}

describe("ModalAdapter in a browser", () => {
  it("restores focus to the opener element after closing", async () => {
    const screen = await renderWithRegistry(
      <ModalProvider>
        <OpenButton />
      </ModalProvider>,
      registry,
    );

    const opener = screen.getByRole("button", { name: "Open" });
    await opener.click();
    await expect.element(screen.getByText("Info")).toBeVisible();

    await screen.getByTestId("dialog-close").click();

    await expect.element(screen.getByText("Info")).not.toBeInTheDocument();
    await expect.element(opener).toHaveFocus();
  });
});

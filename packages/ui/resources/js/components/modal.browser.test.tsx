import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import ModalComponent from "./modal";

describe("ModalComponent in a browser", () => {
  it("restores focus to the opener element after closing", async () => {
    const screen = await render(
      <>
        <button
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent(LATTICE_EVENT.openModal, { detail: { modal: "info" } }),
            )
          }
          type="button"
        >
          Open
        </button>
        <ModalComponent node={fakeNode({ type: "modal", id: "info", props: { title: "Info" } })}>
          <p>Body content</p>
        </ModalComponent>
      </>,
    );

    const opener = screen.getByRole("button", { name: "Open" });
    await opener.click();
    await expect.element(screen.getByText("Info")).toBeVisible();

    await screen.getByTestId("dialog-close").click();

    await expect.element(screen.getByText("Info")).not.toBeInTheDocument();
    await expect.element(opener).toHaveFocus();
  });
});

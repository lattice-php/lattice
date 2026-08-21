import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { PreviewableImage } from "./image-preview";

describe("PreviewableImage lightbox focus in a browser", () => {
  it("restores focus to the thumbnail trigger once the lightbox closes", async () => {
    const screen = await render(
      <PreviewableImage alt="Product photo" previewable src="https://example.test/product.png" />,
    );

    const trigger = screen.getByRole("button", { name: "View image" });
    await trigger.click();

    const close = screen.getByTestId("lightbox-close");
    await expect.element(close).toBeVisible();

    await close.click();

    await expect.element(screen.getByTestId("lightbox-close")).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  });
});

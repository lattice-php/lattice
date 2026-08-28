import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PreviewableImage } from "./image-preview";

describe("PreviewableImage controlled lightbox", () => {
  it("renders the lightbox statically when open is controlled", () => {
    render(
      <PreviewableImage alt="Product photo" open previewable src="https://example.test/p.png" />,
    );

    expect(screen.getByTestId("lightbox-close")).toBeVisible();
  });

  it("reports open changes without becoming controlled", () => {
    const onOpenChange = vi.fn();

    render(
      <PreviewableImage
        alt="Product photo"
        onOpenChange={onOpenChange}
        previewable
        src="https://example.test/p.png"
      />,
    );

    screen.getByRole("button", { name: "View image" }).click();

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});

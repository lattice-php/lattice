import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Image } from "./image";

describe("Image", () => {
  it("opens the lightbox on click and closes it again", () => {
    render(<Image alt="Product photo" previewable src="https://example.test/product.png" />);

    fireEvent.click(screen.getByRole("button", { name: "View image" }));
    expect(document.querySelector('[data-slot="image-lightbox"]')).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(document.querySelector('[data-slot="image-lightbox"]')).not.toBeInTheDocument();
  });

  it("renders a plain image when previewable is off", () => {
    render(<Image alt="Product photo" src="https://example.test/product.png" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByAltText("Product photo")).toBeVisible();
  });
});

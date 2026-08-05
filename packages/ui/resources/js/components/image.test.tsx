import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import ImageComponent from "./image";

function renderImage(props: Record<string, unknown> = {}) {
  const node = fakeNode({
    type: "image",
    props: {
      src: "https://example.test/product.png",
      alt: "Product photo",
      size: null,
      circular: false,
      previewable: true,
      ...props,
    },
  });

  return render(<ImageComponent node={node}>{null}</ImageComponent>);
}

describe("ImageComponent", () => {
  it("renders the image inside a zoom trigger by default", () => {
    renderImage();

    expect(screen.getByRole("button", { name: "View image" })).toBeVisible();
    expect(screen.getByAltText("Product photo")).toBeVisible();
  });

  it("opens the lightbox on click and closes it again", () => {
    renderImage();

    fireEvent.click(screen.getByRole("button", { name: "View image" }));
    expect(document.querySelector('[data-slot="image-lightbox"]')).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(document.querySelector('[data-slot="image-lightbox"]')).not.toBeInTheDocument();
  });

  it("renders a plain image when previewable is off", () => {
    renderImage({ previewable: false });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByAltText("Product photo")).toBeVisible();
  });

  it("applies circular rounding and a fixed size", () => {
    renderImage({ circular: true, size: 64 });

    const image = screen.getByAltText("Product photo");
    expect(image).toHaveClass("rounded-full");
    expect(image).toHaveAttribute("width", "64");
  });
});

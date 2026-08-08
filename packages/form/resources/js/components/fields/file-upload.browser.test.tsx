import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { formFrame } from "@lattice-php/form/test-support";
import { FileUploadComponent } from "./file-upload";

function renderUpload(props: Record<string, unknown> = {}) {
  const node = fakeNode({
    type: "field.file-upload",
    props: {
      name: "images",
      label: "Images",
      image: true,
      signed: false,
      multiple: true,
      files: null,
      ...props,
    },
  });

  return render(
    formFrame(<FileUploadComponent node={node}>{null}</FileUploadComponent>, {
      context: { action: "/forms/products", componentRef: "ref-1" },
    }),
  );
}

// A drag from the OS cannot be scripted headlessly; building a real
// DataTransfer and dispatching the drop event is the honest browser
// equivalent of the gesture and is used only for the drop tests.
function dropFile(target: Element, file: File): void {
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  target.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer }));
}

describe("FileUploadComponent in a browser", () => {
  it("syncs picked files into the native multipart input", async () => {
    const screen = await renderUpload({ image: false });
    const input = screen.getByLabelText("Images");

    await userEvent.upload(input, new File(["file-data"], "manual.pdf"));

    await expect.element(screen.getByText("manual.pdf")).toBeVisible();
    await expect.element(input).toHaveAttribute("name", "images[]");
    await expect
      .poll(() =>
        Array.from((input.element() as HTMLInputElement).files ?? []).map((file) => file.name),
      )
      .toEqual(["manual.pdf"]);
  });

  it("adds files dropped onto the dropzone", async () => {
    const screen = await renderUpload({ image: false });

    dropFile(
      screen.getByTestId("images").element(),
      new File(["file-data"], "manual.pdf", { type: "application/pdf" }),
    );

    await expect.element(screen.getByText("manual.pdf")).toBeVisible();
  });

  it("renders and removes previews for picked image files via real object URLs", async () => {
    const screen = await renderUpload();

    await userEvent.upload(
      screen.getByLabelText("Images"),
      new File(["image-data"], "lamp.jpg", { type: "image/jpeg" }),
    );

    const image = screen.getByRole("img", { name: "lamp.jpg" });

    await expect.element(image).toBeVisible();
    expect((image.element() as HTMLImageElement).src).toMatch(/^blob:/);

    await screen.getByRole("button", { name: "Remove lamp.jpg" }).click();

    await expect.element(screen.getByRole("img", { name: "lamp.jpg" })).not.toBeInTheDocument();
  });

  it("ignores drops when the field is disabled", async () => {
    const screen = await renderUpload({ image: false, disabled: true });

    dropFile(
      screen.getByTestId("images").element(),
      new File(["file-data"], "manual.pdf", { type: "application/pdf" }),
    );

    await expect.element(screen.getByText("manual.pdf")).not.toBeInTheDocument();
  });
});

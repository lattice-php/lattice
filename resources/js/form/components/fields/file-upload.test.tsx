import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { FormProvider } from "../context";
import { FormValuesProvider } from "../values";
import { FileUploadComponent } from "./file-upload";

const apiFetch = vi.hoisted(() => vi.fn<() => Promise<Response>>(() => new Promise(() => {})));

vi.mock("@lattice-php/lattice/core/api", () => ({ apiFetch }));

const createObjectURL = vi.fn<(file: File) => string>((file) => `blob:${file.name}`);
const revokeObjectURL = vi.fn<(url: string) => void>();

function renderUpload(props: Record<string, unknown> = {}) {
  const node = fakeNode({
    type: "form.file-upload",
    props: {
      name: "images",
      label: "Images",
      image: true,
      signed: true,
      multiple: true,
      files: null,
      ...props,
    },
  });

  return render(
    <FormProvider
      value={{
        action: "/forms/products",
        clearErrors: () => {},
        componentRef: "ref-1",
        errors: {},
        fieldLabels: {},
        precognitive: false,
        processing: false,
        validate: () => {},
      }}
    >
      <FormValuesProvider initial={{}}>
        <FileUploadComponent node={node}>{null}</FileUploadComponent>
      </FormValuesProvider>
    </FormProvider>,
  );
}

describe("FileUploadComponent image previews", () => {
  beforeEach(() => {
    apiFetch.mockClear();
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders existing image files with their signed urls", () => {
    renderUpload({
      files: [
        {
          key: "workbench/products/lamp.jpg",
          name: "lamp.jpg",
          url: "https://rustfs.test/lamp.jpg?signature=1",
          size: 10,
          token: "sealed-token",
        },
      ],
    });

    expect(screen.getByRole("img", { name: "lamp.jpg" })).toHaveAttribute(
      "src",
      "https://rustfs.test/lamp.jpg?signature=1",
    );
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it("does not render previews for non-image upload fields", () => {
    renderUpload({
      image: false,
      files: [
        {
          key: "uploads/manual.pdf",
          name: "manual.pdf",
          url: "https://rustfs.test/manual.pdf?signature=1",
          size: 10,
          token: "sealed-token",
        },
      ],
    });

    expect(screen.queryByRole("img", { name: "manual.pdf" })).not.toBeInTheDocument();
    expect(screen.getByText("manual.pdf")).toBeVisible();
  });

  it("renders and revokes local previews for selected image files", () => {
    renderUpload();

    const file = new File(["image-data"], "lamp.jpg", { type: "image/jpeg" });

    fireEvent.change(screen.getByLabelText("Images"), {
      target: { files: [file] },
    });

    expect(createObjectURL).toHaveBeenCalledWith(file);
    expect(screen.getByRole("img", { name: "lamp.jpg" })).toHaveAttribute("src", "blob:lamp.jpg");

    fireEvent.click(screen.getByRole("button", { name: "Remove lamp.jpg" }));

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:lamp.jpg");
    expect(screen.queryByRole("img", { name: "lamp.jpg" })).not.toBeInTheDocument();
  });
});

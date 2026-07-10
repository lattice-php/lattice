import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { FormProvider } from "../../hooks/context";
import { FieldScopeProvider } from "../../hooks/field-scope";
import { FormValuesProvider, useFormValues } from "../../hooks/values";
import { FileUploadComponent } from "./file-upload";

const apiFetch = vi.hoisted(() =>
  vi.fn<() => Promise<Response>>(() => new Promise<Response>(() => {})),
);

vi.mock("@lattice-php/lattice/core/api", () => ({ apiFetch }));

const createObjectURL = vi.fn<(file: File) => string>((file) => `blob:${file.name}`);
const revokeObjectURL = vi.fn<(url: string) => void>();

type RenderUploadOptions = {
  onValues?: (values: Record<string, unknown>) => void;
  props?: Record<string, unknown>;
  values?: Record<string, unknown>;
  scoped?: boolean;
};

function ValuesProbe({ onValues }: { onValues?: (values: Record<string, unknown>) => void }) {
  const values = useFormValues();

  useEffect(() => {
    onValues?.(values);
  }, [onValues, values]);

  return null;
}

function renderUpload({
  onValues,
  props = {},
  values = {},
  scoped = false,
}: RenderUploadOptions = {}) {
  const node = fakeNode({
    type: "field.file-upload",
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
      <FormValuesProvider initial={values}>
        <ValuesProbe onValues={onValues} />
        {scoped ? (
          <FieldScopeProvider base="items" index={0} row={{ id: "row-1" }} onChange={() => {}}>
            <FileUploadComponent node={node}>{null}</FileUploadComponent>
          </FieldScopeProvider>
        ) : (
          <FileUploadComponent node={node}>{null}</FileUploadComponent>
        )}
      </FormValuesProvider>
    </FormProvider>,
  );
}

class SignedUploadRequest {
  static instances: SignedUploadRequest[] = [];

  headers: Record<string, string> = {};

  method = "";

  onerror: (() => void) | null = null;

  onload: (() => void) | null = null;

  status = 204;

  upload: {
    onprogress:
      | ((event: { lengthComputable: boolean; loaded: number; total: number }) => void)
      | null;
  } = { onprogress: null };

  url = "";

  constructor() {
    SignedUploadRequest.instances.push(this);
  }

  open(method: string, url: string): void {
    this.method = method;
    this.url = url;
  }

  send(): void {
    this.upload.onprogress?.({ lengthComputable: true, loaded: 5, total: 10 });
    this.onload?.();
  }

  setRequestHeader(key: string, value: string): void {
    this.headers[key] = value;
  }
}

const sendSignedUploadSuccessfully = SignedUploadRequest.prototype.send;

function successfulSignResponse(key = "tmp/lamp.jpg"): Response {
  return new Response(
    JSON.stringify({
      key,
      url: "https://rustfs.test/tmp/lamp.jpg?signature=1",
      headers: { "x-amz-acl": "private" },
      method: "PUT",
    }),
    { status: 200 },
  );
}

describe("FileUploadComponent image previews", () => {
  beforeEach(() => {
    apiFetch.mockClear();
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
    SignedUploadRequest.instances = [];
    SignedUploadRequest.prototype.send = sendSignedUploadSuccessfully;

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });
    vi.stubGlobal("XMLHttpRequest", SignedUploadRequest);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders existing image files with their signed urls", () => {
    renderUpload({
      props: {
        files: [
          {
            key: "workbench/products/lamp.jpg",
            name: "lamp.jpg",
            url: "https://rustfs.test/lamp.jpg?signature=1",
            size: 10,
            token: "sealed-token",
          },
        ],
      },
    });

    expect(screen.getByRole("img", { name: "lamp.jpg" })).toHaveAttribute(
      "src",
      "https://rustfs.test/lamp.jpg?signature=1",
    );
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it("does not render previews for non-image upload fields", () => {
    renderUpload({
      props: {
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
      },
    });

    expect(screen.queryByRole("img", { name: "manual.pdf" })).not.toBeInTheDocument();
    expect(screen.getByText("manual.pdf")).toBeVisible();
  });

  it("syncs multipart files into the native file input", async () => {
    const originalFiles = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "files");
    const filesByInput = new WeakMap<HTMLInputElement, File[] | null>();
    const filesSetter = vi.fn<(value: File[] | null) => void>();

    Object.defineProperty(HTMLInputElement.prototype, "files", {
      configurable: true,
      get() {
        return filesByInput.get(this) ?? null;
      },
      set(value: File[] | null) {
        filesByInput.set(this, value);
        filesSetter(value);
      },
    });

    vi.stubGlobal(
      "DataTransfer",
      class DataTransfer {
        files: File[] = [];

        items = {
          add: (file: File) => {
            this.files.push(file);
          },
        };
      },
    );

    try {
      renderUpload({ props: { image: false, signed: false } });

      const file = new File(["file-data"], "manual.pdf", { type: "application/pdf" });

      fireEvent.drop(screen.getByTestId("images"), {
        dataTransfer: { files: [file] },
      });

      await waitFor(() => {
        expect(filesSetter).toHaveBeenLastCalledWith([file]);
      });
      expect(filesSetter).toHaveBeenCalledWith([file]);
      expect(screen.getByText("manual.pdf")).toBeVisible();
      expect(screen.getByLabelText("Images")).toHaveAttribute("name", "images[]");
      expect(createObjectURL).not.toHaveBeenCalled();
    } finally {
      if (originalFiles) {
        Object.defineProperty(HTMLInputElement.prototype, "files", originalFiles);
      }
    }
  });

  it("renders and revokes local previews for selected image files", () => {
    renderUpload();

    const file = new File(["image-data"], "lamp.jpg", { type: "image/jpeg" });

    fireEvent.change(screen.getByLabelText("Images"), {
      target: { files: [file] },
    });

    expect(createObjectURL).toHaveBeenCalledWith(file);
    expect(screen.getByRole("img", { name: "lamp.jpg" })).toHaveAttribute("src", "blob:lamp.jpg");

    expect(screen.getByTestId("images-remove")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Remove lamp.jpg" }));

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:lamp.jpg");
    expect(screen.queryByRole("img", { name: "lamp.jpg" })).not.toBeInTheDocument();
  });

  it("opens the native file picker from the dropzone button", () => {
    renderUpload();
    const input = screen.getByLabelText("Images");
    const click = vi.spyOn(input, "click").mockImplementation(() => {});

    fireEvent.click(screen.getByRole("button", { name: "Drop files here or click to browse" }));

    expect(click).toHaveBeenCalled();
  });

  it("allows files to be dropped onto the dropzone", () => {
    renderUpload();

    fireEvent.dragOver(screen.getByTestId("images"));
    fireEvent.drop(screen.getByTestId("images"), {
      dataTransfer: {
        files: [new File(["image-data"], "lamp.jpg", { type: "image/jpeg" })],
      },
    });

    expect(screen.getByRole("img", { name: "lamp.jpg" })).toHaveAttribute("src", "blob:lamp.jpg");
  });

  it("stores signed upload keys after a successful direct upload", async () => {
    apiFetch.mockResolvedValue(successfulSignResponse("tmp/lamp.jpg"));
    const values: Record<string, unknown>[] = [];
    renderUpload({ values: { sku: "LMP-001" }, onValues: (next) => values.push(next) });

    const file = new File(["image-data"], "lamp.jpg", { type: "image/jpeg" });

    fireEvent.change(screen.getByLabelText("Images"), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByTestId("images-uploaded")).toHaveValue("tmp/lamp.jpg");
    });
    await waitFor(() => {
      expect(values.at(-1)).toMatchObject({ images: ["tmp/lamp.jpg"] });
    });

    expect(apiFetch).toHaveBeenCalledWith("/forms/products", {
      method: "POST",
      ref: "ref-1",
      body: JSON.stringify({
        sku: "LMP-001",
        images: [],
        images__removed: [],
        _upload: "images",
        filename: "lamp.jpg",
        contentType: "image/jpeg",
      }),
      throwOnError: false,
    });
    expect(SignedUploadRequest.instances[0]?.method).toBe("PUT");
    expect(SignedUploadRequest.instances[0]?.headers).toEqual({ "x-amz-acl": "private" });
  });

  it("marks a signed upload as failed when signing is rejected", async () => {
    apiFetch.mockResolvedValue(new Response(null, { status: 422 }));
    renderUpload();

    fireEvent.change(screen.getByLabelText("Images"), {
      target: { files: [new File(["image-data"], "lamp.jpg", { type: "image/jpeg" })] },
    });

    expect(await screen.findByText("Failed")).toBeVisible();
  });

  it("marks a signed upload as failed when the direct upload fails", async () => {
    apiFetch.mockResolvedValue(successfulSignResponse());
    SignedUploadRequest.prototype.send = function send(): void {
      this.onerror?.();
    };
    renderUpload();

    fireEvent.change(screen.getByLabelText("Images"), {
      target: { files: [new File(["image-data"], "lamp.jpg", { type: "image/jpeg" })] },
    });

    expect(await screen.findByText("Failed")).toBeVisible();
  });

  it("tracks replaced existing files with sealed removal tokens", async () => {
    apiFetch.mockResolvedValue(successfulSignResponse("tmp/new-lamp.jpg"));
    const { container } = renderUpload({
      props: {
        multiple: false,
        files: [
          {
            key: "workbench/products/old-lamp.jpg",
            name: "old-lamp.jpg",
            url: "https://rustfs.test/old-lamp.jpg?signature=1",
            size: 10,
            token: "sealed-old-lamp",
          },
        ],
      },
    });

    fireEvent.change(screen.getByLabelText("Images"), {
      target: { files: [new File(["image-data"], "new-lamp.jpg", { type: "image/jpeg" })] },
    });

    await waitFor(() => {
      expect(screen.getByTestId("images-uploaded")).toHaveValue("tmp/new-lamp.jpg");
    });

    expect(
      container.querySelector<HTMLInputElement>('input[name="images__removed[]"]')?.value,
    ).toBe("sealed-old-lamp");
    expect(revokeObjectURL).not.toHaveBeenCalledWith(
      "https://rustfs.test/old-lamp.jpg?signature=1",
    );
  });

  it("tracks removed existing files with sealed removal tokens", async () => {
    const values: Record<string, unknown>[] = [];
    const { container } = renderUpload({
      onValues: (next) => values.push(next),
      props: {
        files: [
          {
            key: "workbench/products/lamp.jpg",
            name: "lamp.jpg",
            url: "https://rustfs.test/lamp.jpg?signature=1",
            size: 10,
            token: "sealed-lamp",
          },
        ],
      },
      values: { images: ["workbench/products/lamp.jpg"] },
    });

    fireEvent.click(screen.getByRole("button", { name: "Remove lamp.jpg" }));

    expect(
      container.querySelector<HTMLInputElement>('input[name="images__removed[]"]')?.value,
    ).toBe("sealed-lamp");
    expect(screen.queryByText("lamp.jpg")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(values.at(-1)).toMatchObject({
        images: [],
        images__removed: ["sealed-lamp"],
      });
    });
  });

  it("does not add files when the field is disabled", () => {
    renderUpload({ props: { disabled: true } });

    fireEvent.drop(screen.getByTestId("images"), {
      dataTransfer: {
        files: [new File(["image-data"], "lamp.jpg", { type: "image/jpeg" })],
      },
    });

    expect(screen.queryByText("lamp.jpg")).not.toBeInTheDocument();
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it("uses scoped field names and upload keys inside row fields", async () => {
    apiFetch.mockResolvedValue(successfulSignResponse("tmp/row-lamp.jpg"));
    renderUpload({ scoped: true });

    fireEvent.change(screen.getByLabelText("Images"), {
      target: { files: [new File(["image-data"], "lamp.jpg", { type: "image/jpeg" })] },
    });

    await waitFor(() => {
      expect(screen.getByTestId("images-uploaded")).toHaveAttribute("name", "items[0][images][]");
    });

    expect(apiFetch).toHaveBeenCalledWith(
      "/forms/products",
      expect.objectContaining({
        body: expect.stringContaining('"_upload":"items.0.images"'),
      }),
    );
  });

  it("renders nothing when its visible condition fails", () => {
    const { container } = renderUpload({
      props: { conditions: { visible: [{ field: "flag", operator: "eq", value: "yes" }] } },
    });

    expect(container).toBeEmptyDOMElement();
  });
});

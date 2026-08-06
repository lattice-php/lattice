import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { fakeFormContext } from "@lattice-php/form/test-support";
import { FormProvider } from "@lattice-php/form/hooks/context";
import { FieldScopeProvider } from "@lattice-php/form/hooks/field-scope";
import { FormValuesProvider, useFormValues } from "@lattice-php/form/hooks/values";
import { FileUploadComponent } from "./file-upload";

const apiFetch = vi.hoisted(() =>
  vi.fn<() => Promise<Response>>(() => new Promise<Response>(() => {})),
);

vi.mock("@lattice-php/core/api", () => ({ apiFetch }));

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
    <FormProvider value={fakeFormContext({ action: "/forms/products", componentRef: "ref-1" })}>
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

  it("opens the native file picker from the dropzone button", () => {
    renderUpload();
    const input = screen.getByLabelText("Images");
    const click = vi.spyOn(input, "click").mockImplementation(() => {});

    fireEvent.click(screen.getByRole("button", { name: "Drop files here or click to browse" }));

    expect(click).toHaveBeenCalled();
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
        _sub: "upload",
        _target: "images",
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
        body: expect.stringContaining('"_target":"items.0.images"'),
      }),
    );
  });
});

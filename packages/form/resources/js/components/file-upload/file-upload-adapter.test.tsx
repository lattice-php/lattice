import { fireEvent, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FakeXhr, fakeNode } from "@lattice-php/core/test-support";
import { renderWithForm } from "@lattice-php/form/test-support";
import { useFormValues } from "@lattice-php/form/hooks/values";
import { FileUploadAdapter } from "./file-upload-adapter";

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

  return renderWithForm(
    <>
      <ValuesProbe onValues={onValues} />
      <FileUploadAdapter node={node}>{null}</FileUploadAdapter>
    </>,
    {
      initial: values,
      context: { action: "/forms/products", componentRef: "ref-1" },
      scope: scoped ? { base: "items", index: 0, row: { id: "row-1" } } : undefined,
    },
  );
}

async function signedUpload(): Promise<FakeXhr> {
  return waitFor(() => {
    const request = FakeXhr.instances[0];

    expect(request).toBeDefined();

    return request as FakeXhr;
  });
}

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

describe("FileUploadAdapter image previews", () => {
  beforeEach(() => {
    apiFetch.mockClear();
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
    FakeXhr.reset();

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });
    vi.stubGlobal("XMLHttpRequest", FakeXhr);
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

    const request = await signedUpload();
    request.succeed(204);

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
    expect(request.method).toBe("PUT");
    expect(request.headers).toEqual({ "x-amz-acl": "private" });
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
    renderUpload();

    fireEvent.change(screen.getByLabelText("Images"), {
      target: { files: [new File(["image-data"], "lamp.jpg", { type: "image/jpeg" })] },
    });

    (await signedUpload()).fail();

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

    (await signedUpload()).succeed(204);

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

    (await signedUpload()).succeed(204);

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

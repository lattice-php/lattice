import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UploadTarget, UploadedMedia } from "./components/use-media-upload";
import { createRegistry, eagerComponent, RegistryProvider } from "@lattice-php/core";
import { Renderer } from "@lattice-php/core/renderer";
import type { Schema } from "@lattice-php/core/types";
import { FormProvider } from "@lattice-php/form/hooks/context";
import { FormValuesProvider } from "@lattice-php/form/hooks/values";
import { fakeNode } from "@lattice-php/core/test-support";
import { fakeFormContext } from "@lattice-php/form/test-support";
import { withModal } from "@lattice-php/ui/test/modal";
import DropzoneRemoveComponent from "./dropzone-remove";
import MediaDropzoneComponent from "./media-dropzone";

const upload = vi.hoisted(() => ({
  lastTarget: undefined as UploadTarget | undefined,
  addFiles: vi.fn(),
}));

vi.mock("./components/use-media-upload", () => ({
  useMediaUpload: (target: UploadTarget) => {
    upload.lastTarget = target;

    return { uploads: [], addFiles: upload.addFiles, retry: vi.fn(), dismiss: vi.fn() };
  },
}));

function settleUpload(media: UploadedMedia[]): void {
  act(() => upload.lastTarget?.onUploaded?.(media));
}

const registry = createRegistry({
  name: "test/media-dropzone",
  components: {
    "media.dropzone-remove": eagerComponent(DropzoneRemoveComponent),
    pdf: eagerComponent(({ node: viewer }) => (
      <div data-test="fake-pdf">
        <output>
          viewing {String(viewer.props?.url)} as {String(viewer.props?.filename)}
        </output>
        <Renderer nodes={viewer.schema ?? []} />
      </div>
    )),
  },
});

function schema(withViewer = true): Schema {
  const library = {
    type: "media.library",
    props: { picker: true, accept: "application/pdf,image/*", signed: false, uploadOnly: true },
    schema: [
      {
        type: "action",
        key: "media-upload",
        props: { endpoint: "/lattice/actions/media.upload", ref: "ref-upload", label: "Upload" },
      },
    ],
  };
  const viewer = fakeNode({
    id: "media-dropzone-pdf",
    key: "media-dropzone-pdf",
    type: "pdf",
    props: { url: "", filename: null, height: "100%", maxHeight: null },
    schema: [{ type: "media.dropzone-remove", props: {} }] as Schema,
  });

  return (withViewer ? [library, viewer] : [library]) as Schema;
}

function descriptor(overrides: Partial<UploadedMedia> = {}): UploadedMedia {
  return {
    id: 7,
    name: "invoice.pdf",
    url: "/files/7",
    preview_url: null,
    mime_type: "application/pdf",
    ...overrides,
  };
}

function renderDropzone(props: Record<string, unknown> = {}, nodeSchema: Schema = schema()) {
  const node = fakeNode({
    type: "field.media-dropzone",
    props: {
      name: "document",
      label: "Document",
      multiple: false,
      maxFiles: null,
      uploadOnly: true,
      selected: null,
      height: "24rem",
      emptyText: null,
      ...props,
    },
    schema: nodeSchema,
  });

  return render(
    withModal(
      <RegistryProvider registry={registry}>
        <FormProvider value={fakeFormContext({ action: "/forms/invoices", componentRef: "ref-1" })}>
          <FormValuesProvider initial={{}}>
            <MediaDropzoneComponent node={node}>{null}</MediaDropzoneComponent>
          </FormValuesProvider>
        </FormProvider>
      </RegistryProvider>,
    ),
  );
}

function hiddenValue(container: HTMLElement): string | null {
  return (
    container.querySelector<HTMLInputElement>('input[type="hidden"][name="document"]')?.value ??
    null
  );
}

describe("MediaDropzoneComponent", () => {
  beforeEach(() => {
    upload.addFiles.mockReset();
  });

  it("starts as a click target that opens the file dialog and submits nothing", () => {
    const { container } = renderDropzone();
    const click = vi.spyOn(HTMLInputElement.prototype, "click");

    expect(screen.getByTestId("media-dropzone-target")).toHaveTextContent(
      "Drop a file here or click to upload.",
    );
    expect(hiddenValue(container)).toBe("");
    expect(screen.getByTestId("media-dropzone-face")).toHaveAttribute("style", "height: 24rem;");

    fireEvent.click(screen.getByTestId("media-dropzone-target"));

    expect(click).toHaveBeenCalled();
    click.mockRestore();
  });

  it("uploads the first chosen file and previews a pdf in the viewer with the remove control", () => {
    const { container } = renderDropzone();
    const file = new File(["%PDF"], "invoice.pdf", { type: "application/pdf" });

    fireEvent.change(screen.getByTestId("media-dropzone-input"), { target: { files: [file] } });

    expect(upload.addFiles).toHaveBeenCalledWith([file]);

    settleUpload([descriptor()]);

    expect(hiddenValue(container)).toBe("7");
    expect(screen.getByRole("status")).toHaveTextContent("viewing /files/7 as invoice.pdf");

    fireEvent.click(screen.getByTestId("media-dropzone-remove"));

    expect(hiddenValue(container)).toBe("");
    expect(screen.getByTestId("media-dropzone-target")).toBeInTheDocument();
  });

  it("frames the face itself only when the viewer does not", () => {
    renderDropzone();
    const face = screen.getByTestId("media-dropzone-face");

    expect(face).toHaveClass("border", "border-dashed");

    settleUpload([descriptor()]);

    expect(screen.getByTestId("media-dropzone-face")).not.toHaveClass("border");
  });

  it("previews a stored image inline with its name and the remove control", () => {
    const { container } = renderDropzone({
      selected: [{ ...descriptor({ mime_type: "image/jpeg", name: "receipt.jpg" }), values: {} }],
    });

    expect(hiddenValue(container)).toBe("7");
    expect(container.querySelector("img")).toHaveAttribute("src", "/files/7");
    expect(screen.getByTestId("media-dropzone-face")).toHaveTextContent("receipt.jpg");
    expect(screen.getByTestId("media-dropzone-remove")).toBeInTheDocument();
  });

  it("falls back to the type icon for a pdf without a viewer template", () => {
    renderDropzone({ selected: [{ ...descriptor(), values: {} }] }, schema(false));

    expect(screen.getByTestId("media-dropzone-file")).toHaveTextContent("pdf");
  });

  it("drops straight into an empty face but asks before replacing a stored file", async () => {
    renderDropzone();
    const first = new File(["a"], "a.pdf", { type: "application/pdf" });
    const second = new File(["b"], "b.pdf", { type: "application/pdf" });

    fireEvent.drop(screen.getByTestId("media-dropzone-face"), { dataTransfer: { files: [first] } });

    expect(upload.addFiles).toHaveBeenCalledWith([first]);
    settleUpload([descriptor()]);

    fireEvent.drop(screen.getByTestId("media-dropzone-face"), {
      dataTransfer: { files: [second] },
    });

    expect(upload.addFiles).toHaveBeenCalledTimes(1);
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("Replace this file?");
    expect(dialog).toHaveTextContent("invoice.pdf is replaced by the dropped file.");

    fireEvent.click(screen.getByTestId("confirm-cancel"));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(upload.addFiles).toHaveBeenCalledTimes(1);

    fireEvent.drop(screen.getByTestId("media-dropzone-face"), {
      dataTransfer: { files: [second] },
    });
    fireEvent.click(await screen.findByTestId("confirm-accept"));

    await waitFor(() => expect(upload.addFiles).toHaveBeenCalledWith([second]));
  });

  it("highlights the face while a file is dragged over it", () => {
    renderDropzone();
    const face = screen.getByTestId("media-dropzone-face");

    fireEvent.dragOver(face, { dataTransfer: { files: [] } });
    expect(face).toHaveAttribute("data-drag-active", "true");

    fireEvent.dragLeave(face, { relatedTarget: document.body });
    expect(face).not.toHaveAttribute("data-drag-active");
  });

  it("renders no remove control outside a dropzone", () => {
    const { container } = render(
      <DropzoneRemoveComponent node={fakeNode({ type: "media.dropzone-remove", props: {} })}>
        {null}
      </DropzoneRemoveComponent>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("locks the face when the field is read only", () => {
    renderDropzone({ readOnly: true, selected: [{ ...descriptor(), values: {} }] });

    expect(screen.getByTestId("media-dropzone-remove")).toBeDisabled();

    fireEvent.drop(screen.getByTestId("media-dropzone-face"), {
      dataTransfer: { files: [new File(["b"], "b.pdf", { type: "application/pdf" })] },
    });

    expect(upload.addFiles).not.toHaveBeenCalled();
  });
});

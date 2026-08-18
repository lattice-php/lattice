import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { UploadTarget, UploadedMedia } from "./components/use-media-upload";
import { createRegistry, eagerComponent, RegistryProvider } from "@lattice-php/core";
import type { RendererComponent, Schema } from "@lattice-php/core/types";
import { FormProvider } from "@lattice-php/form/hooks/context";
import { useFieldScope } from "@lattice-php/form/hooks/field-scope";
import { FormValuesProvider } from "@lattice-php/form/hooks/values";
import { fakeNode } from "@lattice-php/core/test-support";
import { fakeFormContext } from "@lattice-php/form/test-support";
import { withModalHost } from "@lattice-php/ui/test/modal";
import { libraryRow } from "./test-support";
import MediaPickerComponent from "./media-picker";

const upload = vi.hoisted(() => ({
  lastTarget: undefined as
    | undefined
    | { endpoint: string; onUploaded?: (media: unknown[]) => void },
  addFiles: vi.fn(),
}));

vi.mock("./components/use-media-upload", () => ({
  useMediaUpload: (target: { endpoint: string }) => {
    upload.lastTarget = target;

    return { uploads: [], addFiles: upload.addFiles, retry: vi.fn(), dismiss: vi.fn() };
  },
}));

function settleUpload(media: UploadedMedia[]): void {
  act(() => (upload.lastTarget as UploadTarget).onUploaded?.(media));
}

const CaptionField: RendererComponent<"field.text-input"> = ({ node }) => {
  const scope = useFieldScope();
  const value = (scope?.getValue(node.props.name) as string | undefined) ?? "";

  return (
    <input
      data-test="caption-input"
      name={scope?.scopedName(node.props.name) ?? node.props.name}
      onChange={(event) => scope?.setValue(node.props.name, event.target.value)}
      value={value}
    />
  );
};

const registry = createRegistry({
  name: "test",
  components: { "field.text-input": eagerComponent(CaptionField) },
});

function captionTemplate(): Schema {
  return [
    ...librarySchema([]),
    { type: "field.text-input", props: { name: "caption", label: "Caption" } },
  ] as Schema;
}

function librarySchema(rows: ReturnType<typeof libraryRow>[]): Schema {
  return [
    {
      type: "media.library",
      props: { picker: true, accept: null, signed: false },
      schema: [{ type: "table", props: { columns: [], data: rows } }],
    },
  ] as Schema;
}

function uploadOnlySchema(label: string | null = null): Schema {
  return [
    {
      type: "media.library",
      props: { picker: true, accept: "text/csv", signed: false },
      schema: [
        {
          type: "action",
          key: "media-upload",
          props: { endpoint: "/lattice/actions/media.upload", ref: "ref-upload", label },
        },
      ],
    },
  ] as Schema;
}

function renderPicker(props: Record<string, unknown> = {}, schema?: Schema) {
  const node = fakeNode({
    type: "field.media-picker",
    props: {
      name: "cover",
      label: "Cover",
      multiple: false,
      maxFiles: null,
      selected: [
        {
          id: 7,
          name: "cover.jpg",
          url: null,
          preview_url: null,
          mime_type: "image/jpeg",
          values: {},
        },
      ],
      ...props,
    },
    schema,
  });

  return render(
    withModalHost(
      <RegistryProvider registry={registry}>
        <FormProvider value={fakeFormContext({ action: "/forms/products", componentRef: "ref-1" })}>
          <FormValuesProvider initial={{}}>
            <MediaPickerComponent node={node}>{null}</MediaPickerComponent>
          </FormValuesProvider>
        </FormProvider>
      </RegistryProvider>,
    ),
  );
}

describe("MediaPickerComponent", () => {
  it("submits the single selected id through one hidden input", () => {
    const { container } = renderPicker();

    expect(screen.getByTestId("media-picker-cover")).toHaveTextContent("cover.jpg");
    expect(container.querySelector('input[type="hidden"][name="cover"]')).toHaveValue("7");
  });

  it("shows the derivative in the chip, not the original", () => {
    renderPicker({
      selected: [
        {
          id: 7,
          name: "cover.jpg",
          url: "/storage/media/cover.jpg",
          preview_url: "/storage/media/conversions/cover-thumb.webp",
          mime_type: "image/jpeg",
          values: {},
        },
      ],
    });

    expect(screen.getByTestId("media-picker-item").querySelector("img")).toHaveAttribute(
      "src",
      "/storage/media/conversions/cover-thumb.webp",
    );
  });

  it("clears the submitted value when the chip is removed", () => {
    const { container } = renderPicker();

    fireEvent.click(screen.getByTestId("media-picker-remove"));

    expect(container.querySelector('input[type="hidden"][name="cover"]')).toHaveValue("");
    expect(screen.queryByTestId("media-picker-item")).toBeNull();
  });

  it("submits one hidden input per id in multiple mode", () => {
    const { container } = renderPicker({
      multiple: true,
      selected: [
        { id: 7, name: "a.jpg", url: null, preview_url: null, mime_type: "image/jpeg", values: {} },
        { id: 9, name: "b.jpg", url: null, preview_url: null, mime_type: "image/jpeg", values: {} },
      ],
    });

    expect(container.querySelectorAll('input[type="hidden"][name="cover[]"]')).toHaveLength(2);
  });

  it("hides the remove and open affordances when the field is read only", () => {
    renderPicker({ readOnly: true });

    expect(screen.queryByTestId("media-picker-remove")).toBeNull();
    expect(screen.getByTestId("media-picker-open")).toBeDisabled();
  });

  it("merging newly picked items with already-picked ones respects maxFiles", () => {
    const { container } = renderPicker(
      {
        multiple: true,
        maxFiles: 2,
        selected: [
          {
            id: 1,
            name: "a.jpg",
            url: null,
            preview_url: null,
            mime_type: "image/jpeg",
            values: {},
          },
        ],
      },
      librarySchema([libraryRow(10, { name: "d.jpg" }), libraryRow(11, { name: "e.jpg" })]),
    );

    fireEvent.click(screen.getByTestId("media-picker-open"));
    fireEvent.click(screen.getAllByTestId("media-card")[0]);
    fireEvent.click(screen.getAllByTestId("media-card")[1]);
    fireEvent.click(screen.getByTestId("media-pick-confirm"));

    expect(container.querySelectorAll('input[type="hidden"][name="cover[]"]')).toHaveLength(2);
  });

  it("submits indexed id inputs and seeds row values when a template is present", () => {
    const { container } = renderPicker(
      {
        name: "gallery",
        multiple: true,
        selected: [
          {
            id: 7,
            name: "a.jpg",
            url: null,
            preview_url: null,
            mime_type: "image/jpeg",
            values: { caption: "Front" },
          },
          {
            id: 9,
            name: "b.jpg",
            url: null,
            preview_url: null,
            mime_type: "image/jpeg",
            values: {},
          },
        ],
      },
      captionTemplate(),
    );

    expect(container.querySelector('input[type="hidden"][name="gallery[0][id]"]')).toHaveValue("7");
    expect(container.querySelector('input[type="hidden"][name="gallery[1][id]"]')).toHaveValue("9");
  });

  it("keeps plain id inputs when no template is present", () => {
    const { container } = renderPicker(
      {
        name: "gallery",
        multiple: true,
        selected: [
          {
            id: 7,
            name: "a.jpg",
            url: null,
            preview_url: null,
            mime_type: "image/jpeg",
            values: {},
          },
        ],
      },
      librarySchema([]),
    );

    expect(container.querySelector('input[type="hidden"][name="gallery[]"]')).toHaveValue("7");
  });

  it("wires each row's template field to its own scope for reading and writing values", () => {
    renderPicker(
      {
        name: "gallery",
        multiple: true,
        selected: [
          {
            id: 7,
            name: "a.jpg",
            url: null,
            preview_url: null,
            mime_type: "image/jpeg",
            values: { caption: "Front" },
          },
          {
            id: 9,
            name: "b.jpg",
            url: null,
            preview_url: null,
            mime_type: "image/jpeg",
            values: {},
          },
        ],
      },
      captionTemplate(),
    );

    const inputs = screen.getAllByTestId("caption-input");
    expect(inputs[0]).toHaveAttribute("name", "gallery[0][caption]");
    expect(inputs[0]).toHaveValue("Front");
    expect(inputs[1]).toHaveAttribute("name", "gallery[1][caption]");
    expect(inputs[1]).toHaveValue("");

    fireEvent.change(inputs[1], { target: { value: "Back" } });

    expect(inputs[1]).toHaveValue("Back");
    expect(inputs[0]).toHaveValue("Front");
  });

  it("reindexes remaining rows and keeps their values after removing one", () => {
    const { container } = renderPicker(
      {
        name: "gallery",
        multiple: true,
        selected: [
          {
            id: 7,
            name: "a.jpg",
            url: null,
            preview_url: null,
            mime_type: "image/jpeg",
            values: { caption: "Front" },
          },
          {
            id: 9,
            name: "b.jpg",
            url: null,
            preview_url: null,
            mime_type: "image/jpeg",
            values: { caption: "Back" },
          },
        ],
      },
      captionTemplate(),
    );

    fireEvent.click(screen.getAllByTestId("media-picker-remove")[0]);

    expect(container.querySelector('input[type="hidden"][name="gallery[0][id]"]')).toHaveValue("9");
    expect(screen.getByTestId("caption-input")).toHaveValue("Back");
  });

  it("submits a single-mode template row indexed at 0", () => {
    const { container } = renderPicker(
      {
        name: "cover",
        multiple: false,
        selected: [
          {
            id: 7,
            name: "a.jpg",
            url: null,
            preview_url: null,
            mime_type: "image/jpeg",
            values: { caption: "Front" },
          },
        ],
      },
      captionTemplate(),
    );

    expect(container.querySelector('input[type="hidden"][name="cover[0][id]"]')).toHaveValue("7");
    expect(screen.getByTestId("caption-input")).toHaveValue("Front");
  });

  it("keeps submitting per-item template fields when the picker is read only", () => {
    renderPicker(
      {
        name: "gallery",
        multiple: true,
        readOnly: true,
        selected: [
          {
            id: 7,
            name: "a.jpg",
            url: null,
            preview_url: null,
            mime_type: "image/jpeg",
            values: { caption: "Front" },
          },
        ],
      },
      captionTemplate(),
    );

    const input = screen.getByTestId("caption-input");
    expect(input).toHaveAttribute("name", "gallery[0][caption]");
    expect(input).toHaveValue("Front");
  });

  it("prefers the wire pickerLabel over the translated trigger label", () => {
    renderPicker({ pickerLabel: "Choose import" });

    expect(screen.getByTestId("media-picker-open")).toHaveTextContent("Choose import");
  });

  it("upload-only mode picks the settled upload without offering the library", () => {
    const { container } = renderPicker({ uploadOnly: true, selected: [] }, uploadOnlySchema());

    expect(screen.queryByTestId("media-picker-open")).toBeNull();
    expect(screen.queryByTestId("media-picker-dialog")).toBeNull();

    settleUpload([
      { id: 42, name: "import.csv", url: null, preview_url: null, mime_type: "text/csv" },
    ]);

    expect(container.querySelector('input[type="hidden"][name="cover"]')).toHaveValue("42");
    expect(screen.getByTestId("media-picker-item")).toHaveTextContent("import.csv");
  });

  it("upload-only single mode replaces the previous pick with the fresh upload", () => {
    const { container } = renderPicker({ uploadOnly: true }, uploadOnlySchema());

    settleUpload([
      { id: 42, name: "import.csv", url: null, preview_url: null, mime_type: "text/csv" },
    ]);

    expect(container.querySelector('input[type="hidden"][name="cover"]')).toHaveValue("42");
    expect(screen.getAllByTestId("media-picker-item")).toHaveLength(1);
  });

  it("upload-only mode labels the button from the upload action and forwards the file selection", () => {
    renderPicker({ uploadOnly: true, selected: [] }, uploadOnlySchema("Upload import file"));

    const button = screen.getByTestId("media-picker-upload");
    expect(button).toHaveTextContent("Upload import file");
    expect(upload.lastTarget?.endpoint).toBe("/lattice/actions/media.upload");

    const input = screen.getByTestId("media-picker-upload-input");
    expect(input).toHaveAttribute("accept", "text/csv");

    const selected = new File(["a;b"], "rows.csv", { type: "text/csv" });
    fireEvent.change(input, { target: { files: [selected] } });

    expect(upload.addFiles).toHaveBeenCalledWith(expect.objectContaining({ 0: selected }));
  });

  it("omits per-item template fields when the picker is disabled", () => {
    renderPicker(
      {
        name: "gallery",
        multiple: true,
        disabled: true,
        selected: [
          {
            id: 7,
            name: "a.jpg",
            url: null,
            preview_url: null,
            mime_type: "image/jpeg",
            values: { caption: "Front" },
          },
        ],
      },
      captionTemplate(),
    );

    expect(screen.queryByTestId("caption-input")).toBeNull();
  });
});

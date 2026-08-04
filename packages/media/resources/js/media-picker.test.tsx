import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent, RegistryContext, type Plugin } from "@lattice-php/core";
import type { RendererComponent, Schema } from "@lattice-php/core/types";
import { FormProvider } from "@lattice-php/form/hooks/context";
import { useFieldScope } from "@lattice-php/form/hooks/field-scope";
import { FormValuesProvider } from "@lattice-php/form/hooks/values";
import { fakeFormContext, fakeNode } from "./test-support";
import MediaPickerComponent from "./media-picker";

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
} satisfies Plugin);

function captionTemplate(): Schema {
  return [
    ...librarySchema([]),
    { type: "field.text-input", props: { name: "caption", label: "Caption" } },
  ] as Schema;
}

function libraryRow(id: number, name: string) {
  return {
    id,
    url: null,
    preview_url: null,
    name,
    mime_type: "image/jpeg",
    size: 100,
    alt: null,
    created_at: "2026-07-29T00:00:00Z",
    attachments_count: 0,
  };
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

function renderPicker(props: Record<string, unknown> = {}, schema?: Schema) {
  const node = fakeNode({
    type: "field.media-picker",
    props: {
      name: "cover",
      label: "Cover",
      multiple: false,
      maxFiles: null,
      selected: [
        { id: 7, name: "cover.jpg", url: null, preview_url: null, mime_type: "image/jpeg" },
      ],
      ...props,
    },
    schema,
  });

  return render(
    <RegistryContext.Provider value={registry}>
      <FormProvider value={fakeFormContext({ action: "/forms/products", componentRef: "ref-1" })}>
        <FormValuesProvider initial={{}}>
          <MediaPickerComponent node={node}>{null}</MediaPickerComponent>
        </FormValuesProvider>
      </FormProvider>
    </RegistryContext.Provider>,
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
        { id: 7, name: "a.jpg", url: null, preview_url: null, mime_type: "image/jpeg" },
        { id: 9, name: "b.jpg", url: null, preview_url: null, mime_type: "image/jpeg" },
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
        selected: [{ id: 1, name: "a.jpg", url: null, preview_url: null, mime_type: "image/jpeg" }],
      },
      librarySchema([libraryRow(10, "d.jpg"), libraryRow(11, "e.jpg")]),
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
        selected: [{ id: 7, name: "a.jpg", url: null, preview_url: null, mime_type: "image/jpeg" }],
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

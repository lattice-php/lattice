import { fakeNode } from "@lattice-php/core/test-support";
import { describe, expect, it } from "vitest";
import { boundFieldFor, boundFields, patchDocument, patchText, unboundSchema } from "./bindings";

const schema = [
  fakeNode({ props: { label: "Title", name: "title" }, type: "field.text-input" }),
  fakeNode({
    props: {},
    schema: [
      fakeNode({ props: { extensions: [], name: "intro" }, type: "field.rich-editor" }),
      fakeNode({ props: { name: "target" }, type: "field.select" }),
    ],
    type: "grid",
  }),
  fakeNode({ props: { name: "image" }, type: "field.media-picker" }),
];

const rendered = fakeNode({
  props: {},
  schema: [
    fakeNode({ props: { binding: "title", level: 1, text: "Hi" }, type: "heading" }),
    fakeNode({ props: { binding: "intro", document: null, html: "" }, type: "blocks.rich-text" }),
    fakeNode({ props: { binding: "cta", label: "Go" }, type: "button" }),
    fakeNode({
      props: { blockId: "b", name: "content" },
      schema: [fakeNode({ props: { binding: "nested", text: "child" }, type: "text" })],
      type: "blocks.slot",
    }),
  ],
  type: "stack",
});

describe("bindings", () => {
  it("classifies a bound field by the control that edits it, searching nested containers", () => {
    expect(boundFieldFor(schema, "title")?.kind).toBe("text");
    expect(boundFieldFor(schema, "intro")?.kind).toBe("rich");
    expect(boundFieldFor(schema, "target")?.kind).toBe("field");
    expect(boundFieldFor(schema, "image")?.kind).toBe("media");
    expect(boundFieldFor(schema, "missing")).toBeNull();
  });

  it("lists bound fields of a render without descending into child-block slots", () => {
    expect(boundFields(rendered)).toEqual(["title", "intro", "cta"]);
  });

  it("drops bound fields from the inspector schema and empties containers with them", () => {
    const remaining = unboundSchema(schema, ["title", "intro", "image"]);

    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.type).toBe("grid");
    expect(remaining[0]?.schema?.map((node) => (node.props as { name: string }).name)).toEqual([
      "target",
    ]);
    expect(unboundSchema(schema, [])).toEqual(schema);
  });

  it("patches the text prop matching the bound node type and leaves other nodes shared", () => {
    const patched = patchText(rendered, "cta", "Buy");
    const button = patched.schema?.[2];
    const heading = patched.schema?.[0];

    expect(button?.props).toMatchObject({ label: "Buy" });
    expect(heading).toBe(rendered.schema?.[0]);
    expect(patchText(rendered, "title", "Hello").schema?.[0]?.props).toMatchObject({
      text: "Hello",
    });
  });

  it("patches a rich-text document in place", () => {
    const document = { content: [], type: "doc" };
    const patched = patchDocument(rendered, "intro", document);

    expect(patched.schema?.[1]?.props).toMatchObject({ document });
    expect(patchDocument(rendered, "unknown", document)).toBe(rendered);
  });
});

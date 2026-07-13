import { describe, expect, it, vi } from "vitest";
import type { EditorExtension } from "@lattice-php/lattice/types/generated";
import { registerBuiltinRichEditorExtensions } from "./builtins";
import {
  assembleStarterKitOptions,
  assembleToolbar,
  resolveRichEditorExtensions,
} from "./registry";

registerBuiltinRichEditorExtensions();

const DEFAULT_SET: EditorExtension[] = [
  { type: "bold", props: {} },
  { type: "italic", props: {} },
  { type: "strike", props: {} },
  { type: "underline", props: {} },
  { type: "highlight", props: {} },
  { type: "code", props: {} },
  { type: "heading", props: {} },
  { type: "bullet-list", props: {} },
  { type: "ordered-list", props: {} },
  { type: "blockquote", props: {} },
  { type: "code-block", props: {} },
  { type: "horizontal-rule", props: {} },
  { type: "text-align", props: {} },
  { type: "link", props: {} },
  { type: "table", props: {} },
  { type: "details", props: {} },
  { type: "emoji", props: {} },
];

describe("built-in definitions", () => {
  it("resolves the whole default set without warnings", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(resolveRichEditorExtensions(DEFAULT_SET)).toHaveLength(17);
    expect(warn).not.toHaveBeenCalled();

    warn.mockRestore();
  });

  it("assembles the default StarterKit with the previously hardcoded features", () => {
    const options = assembleStarterKitOptions(resolveRichEditorExtensions(DEFAULT_SET));

    expect(options.bold).toEqual({});
    expect(options.heading).toEqual({ levels: [1, 2, 3, 4, 5, 6] });
    expect(options.listItem).toEqual({});
    expect(options.link).toEqual({ openOnClick: false });
    expect(options.code).toEqual({});
  });

  it("passes heading levels and link options from the wire props into StarterKit", () => {
    const options = assembleStarterKitOptions(
      resolveRichEditorExtensions([
        { type: "heading", props: { levels: [2, 3] } },
        { type: "link", props: { protocols: ["https", "mailto"], openOnClick: true } },
      ]),
    );

    expect(options.heading).toEqual({ levels: [2, 3] });
    expect(options.link).toEqual({ openOnClick: true, protocols: ["https", "mailto"] });
  });

  it("renders the default toolbar in the previously hardcoded group order", () => {
    const entries = assembleToolbar(resolveRichEditorExtensions(DEFAULT_SET));

    expect(entries.map((entry) => (entry === "separator" ? "|" : entry.key))).toEqual([
      "bold",
      "italic",
      "strikethrough",
      "underline",
      "highlight",
      "code",
      "|",
      "heading",
      "|",
      "bullet-list",
      "ordered-list",
      "blockquote",
      "code-block",
      "horizontal-rule",
      "|",
      "align-left",
      "align-center",
      "align-right",
      "justify",
      "|",
      "link",
      "|",
      "insert-table",
      "add-column",
      "add-row",
      "delete-table",
      "details",
      "|",
      "insert-emoji",
    ]);
  });

  it("renders only the configured text-align buttons", () => {
    const entries = assembleToolbar(
      resolveRichEditorExtensions([
        { type: "text-align", props: { alignments: ["left", "right"] } },
      ]),
    );

    expect(entries.map((entry) => (entry === "separator" ? "|" : entry.key))).toEqual([
      "align-left",
      "align-right",
    ]);
  });
});

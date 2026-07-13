import { describe, expect, it, vi } from "vitest";
import { DEFAULT_RICH_EDITOR_EXTENSIONS } from "./builtins";
import {
  assembleStarterKitOptions,
  assembleToolbar,
  resolveRichEditorExtensions,
} from "./registry";

describe("built-in definitions", () => {
  it("resolves the whole default set without warnings", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(resolveRichEditorExtensions(DEFAULT_RICH_EDITOR_EXTENSIONS)).toHaveLength(16);
    expect(warn).not.toHaveBeenCalled();

    warn.mockRestore();
  });

  it("assembles the default StarterKit with the previously hardcoded features", () => {
    const options = assembleStarterKitOptions(
      resolveRichEditorExtensions(DEFAULT_RICH_EDITOR_EXTENSIONS),
    );

    expect(options.bold).toEqual({});
    expect(options.heading).toEqual({ levels: [1, 2, 3, 4, 5, 6] });
    expect(options.listItem).toEqual({});
    expect(options.link).toEqual({ openOnClick: false });
    expect(options.code).toBe(false);
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
    const entries = assembleToolbar(resolveRichEditorExtensions(DEFAULT_RICH_EDITOR_EXTENSIONS));

    expect(entries.map((entry) => (entry === "separator" ? "|" : entry.key))).toEqual([
      "bold",
      "italic",
      "strikethrough",
      "underline",
      "highlight",
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

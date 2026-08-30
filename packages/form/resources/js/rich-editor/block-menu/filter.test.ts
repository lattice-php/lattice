import type { Editor } from "@tiptap/core";
import { describe, expect, it } from "vitest";
import type { BlockCommandEntry } from "../registry";
import { filterBlockCommands } from "./filter";

const editor = {} as Editor;

const translations: Record<string, string> = {
  "heading-1": "Überschrift 1",
  "bullet-list": "Aufzählung",
};

function translate(key: string, fallback: string): string {
  return translations[key] ?? fallback;
}

function entry(overrides: Partial<BlockCommandEntry> & Pick<BlockCommandEntry, "key" | "label">) {
  return { group: "blocks", icon: "check", run: () => {}, ...overrides };
}

const COMMANDS: BlockCommandEntry[] = [
  entry({ key: "heading-1", label: "Heading 1", keywords: ["h1", "title"] }),
  entry({ key: "bullet-list", label: "Bullet list", keywords: ["ul"] }),
  entry({ key: "insert-table", label: "Insert table", isAvailable: () => false }),
];

describe("filterBlockCommands", () => {
  it("returns everything available for an empty query", () => {
    expect(filterBlockCommands(COMMANDS, "", editor, translate).map((c) => c.key)).toEqual([
      "heading-1",
      "bullet-list",
    ]);
  });

  it("matches the translated label case-insensitively", () => {
    expect(filterBlockCommands(COMMANDS, "über", editor, translate).map((c) => c.key)).toEqual([
      "heading-1",
    ]);
  });

  it("matches the untranslated fallback label", () => {
    expect(filterBlockCommands(COMMANDS, "Bullet", editor, translate).map((c) => c.key)).toEqual([
      "bullet-list",
    ]);
  });

  it("matches keywords and the key itself", () => {
    expect(filterBlockCommands(COMMANDS, "h1", editor, translate).map((c) => c.key)).toEqual([
      "heading-1",
    ]);
    expect(filterBlockCommands(COMMANDS, "ul", editor, translate).map((c) => c.key)).toEqual([
      "bullet-list",
    ]);
  });

  it("excludes unavailable commands even when they match", () => {
    expect(filterBlockCommands(COMMANDS, "table", editor, translate)).toEqual([]);
  });
});

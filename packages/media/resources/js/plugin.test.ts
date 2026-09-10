import { expect, it } from "vitest";
import plugin from "./plugin";
import { RICH_EDITOR_EXTENSION } from "@lattice-php/form/rich-editor";

it("registers every media node type and the rich editor image extension", () => {
  expect(plugin.name).toBe("media");
  expect(Object.keys(plugin.components)).toEqual([
    "media.library",
    "media.dropzone-remove",
    "field.media-picker",
    "field.media-dropzone",
  ]);
  expect(Object.keys(plugin.extensions[RICH_EDITOR_EXTENSION])).toEqual(["media-image"]);
  expect(plugin.i18n.namespace).toBe("media");
});

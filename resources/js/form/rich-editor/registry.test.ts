import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assembleStarterKitOptions,
  assembleTiptapExtensions,
  assembleToolbar,
  registerRichEditorExtension,
  resolveRichEditorExtensions,
  type ToolbarButton,
} from "./registry";

function button(key: string): ToolbarButton {
  return {
    icon: "check",
    key,
    label: key,
    isActive: () => false,
    run: () => {},
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("resolveRichEditorExtensions", () => {
  it("resolves registered types with their wire props", () => {
    registerRichEditorExtension("custom-a", { toolbar: () => [button("a")] });

    const resolved = resolveRichEditorExtensions([{ type: "custom-a", props: { flavor: "sour" } }]);

    expect(resolved).toHaveLength(1);
    expect(resolved[0].type).toBe("custom-a");
    expect(resolved[0].props).toEqual({ flavor: "sour" });
    expect(resolved[0].group).toBe("custom-a");
  });

  it("defaults missing props to an empty object", () => {
    registerRichEditorExtension("custom-b", {});

    expect(resolveRichEditorExtensions([{ type: "custom-b", props: {} }])[0].props).toEqual({});
  });

  it("warns once and skips unknown types", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const resolved = resolveRichEditorExtensions([
      { type: "never-registered", props: {} },
      { type: "never-registered", props: {} },
    ]);

    expect(resolved).toEqual([]);
    expect(warn).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledWith(
      '[Lattice] Rich-editor extension "never-registered" is not registered.',
    );
  });
});

describe("assembleStarterKitOptions", () => {
  it("disables every optional feature when nothing contributes", () => {
    const options = assembleStarterKitOptions([]);

    expect(options.bold).toBe(false);
    expect(options.heading).toBe(false);
    expect(options.link).toBe(false);
    expect(options.code).toBe(false);
    expect(options.document).toBeUndefined();
    expect(options.undoRedo).toBeUndefined();
    expect(options.trailingNode).toBeUndefined();
  });

  it("merges contributions from the active extensions over the disabled baseline", () => {
    registerRichEditorExtension("custom-c", {
      starterKit: (props) => ({ heading: { levels: props.levels as [1] } }),
    });

    const options = assembleStarterKitOptions(
      resolveRichEditorExtensions([{ type: "custom-c", props: { levels: [1] } }]),
    );

    expect(options.heading).toEqual({ levels: [1] });
    expect(options.bold).toBe(false);
  });
});

describe("assembleToolbar", () => {
  it("keeps wire order and separates contributions from different groups", () => {
    registerRichEditorExtension("mark-a", { group: "marks", toolbar: () => [button("a")] });
    registerRichEditorExtension("mark-b", { group: "marks", toolbar: () => [button("b")] });
    registerRichEditorExtension("block-c", { toolbar: () => [button("c"), button("d")] });

    const entries = assembleToolbar(
      resolveRichEditorExtensions([
        { type: "mark-a", props: {} },
        { type: "mark-b", props: {} },
        { type: "block-c", props: {} },
      ]),
    );

    expect(entries.map((entry) => (entry === "separator" ? entry : `item:${entry.key}`))).toEqual([
      "item:a",
      "item:b",
      "separator",
      "item:c",
      "item:d",
    ]);
  });

  it("skips extensions without toolbar contributions entirely", () => {
    registerRichEditorExtension("silent", { starterKit: () => ({ bold: {} }) });
    registerRichEditorExtension("loud", { toolbar: () => [button("loud")] });

    const entries = assembleToolbar(
      resolveRichEditorExtensions([
        { type: "loud", props: {} },
        { type: "silent", props: {} },
        { type: "loud", props: {} },
      ]),
    );

    expect(entries.filter((entry) => entry === "separator")).toHaveLength(0);
  });
});

describe("assembleTiptapExtensions", () => {
  it("flat-maps the instances of every active extension", () => {
    const fakeExtension = { name: "fake" };
    registerRichEditorExtension("with-instances", {
      extensions: () => [fakeExtension as never],
    });
    registerRichEditorExtension("without-instances", {});

    expect(
      assembleTiptapExtensions(
        resolveRichEditorExtensions([
          { type: "with-instances", props: {} },
          { type: "without-instances", props: {} },
        ]),
      ),
    ).toEqual([fakeExtension]);
  });
});

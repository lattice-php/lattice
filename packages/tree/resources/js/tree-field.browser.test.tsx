import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import { createRegistry } from "@lattice-php/core/registry";
import { fakeNode } from "@lattice-php/core/test-support";
import type { ComponentPropsOf, Node } from "@lattice-php/core";
import formComponents from "@lattice-php/form/plugin";
import { formFrame } from "@lattice-php/form/test-support";
import type { RowTemplateData } from "@lattice-php/form/generated";
import TreeFieldComponent from "./tree-field";

const templates: RowTemplateData[] = [
  {
    type: "product",
    label: "Product",
    schema: [fakeNode({ id: "p", type: "field.text-input", props: { name: "sku", label: "SKU" } })],
  },
  {
    type: "text",
    label: "Text",
    schema: [
      fakeNode({ id: "t", type: "field.text-input", props: { name: "content", label: "Content" } }),
    ],
  },
];

function treeNode(props: Partial<ComponentPropsOf<"field.tree">> = {}): Node<"field.tree"> {
  return fakeNode({
    type: "field.tree",
    props: {
      name: "items",
      reorderable: true,
      defaultItems: 0,
      maxDepth: 2,
      childBearingTypes: ["product"],
      templates,
      ...props,
    },
  });
}

function renderTreeField(items: Record<string, unknown>[], props: Record<string, unknown> = {}) {
  return render(
    formFrame(<TreeFieldComponent node={treeNode(props)}>{null}</TreeFieldComponent>, {
      initial: { items },
      registry: createRegistry(formComponents),
    }),
  );
}

function locator(selector: string) {
  const element = document.querySelector(selector);

  if (!element) {
    throw new Error(`No element for ${selector}`);
  }

  return page.elementLocator(element as HTMLElement);
}

async function dragRowOnto(
  sourceIndexPath: string,
  targetIndexPath: string,
  verticalRatio: number,
): Promise<void> {
  const target = locator(`[data-test="tree-field-${targetIndexPath}"]`);
  const rect = target.element().getBoundingClientRect();

  await userEvent.dragAndDrop(locator(`[data-test="tree-field-${sourceIndexPath}"]`), target, {
    targetPosition: { x: Math.round(rect.width / 2), y: Math.round(rect.height * verticalRatio) },
  });
}

function hiddenValue(name: string): string | null {
  return document.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.value ?? null;
}

const productRow = { rowId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", type: "product", sku: "A" };
const textRow = { rowId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", type: "text", content: "note" };

describe("tree field drag and drop in a browser", () => {
  it("reorders root rows and reindexes the submitted inputs", async () => {
    await renderTreeField([productRow, textRow]);

    await dragRowOnto("items-drag-0", "items-row-1", 0.9);

    await expect.poll(() => hiddenValue("items[0][type]")).toBe("text");
    expect(hiddenValue("items[1][type]")).toBe("product");
    await expect
      .poll(() => document.body.textContent, { timeout: 3000 })
      .toContain("Moved Product");
  });

  it("nests a row dropped onto the middle of a child-bearing row", async () => {
    await renderTreeField([productRow, textRow]);

    await dragRowOnto("items-drag-1", "items-row-0", 0.5);

    await expect.poll(() => hiddenValue("items[0][children][0][type]")).toBe("text");
    expect(hiddenValue("items[1][type]")).toBeNull();
  });

  it("blocks nesting under a type that does not accept children", async () => {
    await renderTreeField([productRow, textRow]);

    await dragRowOnto("items-drag-0", "items-row-1", 0.5);

    expect(hiddenValue("items[1][children][0][type]")).toBeNull();
    expect(hiddenValue("items[0][type]")).toBe("product");
  });

  it("blocks a drop whose subtree would exceed the max depth", async () => {
    await renderTreeField([
      {
        ...productRow,
        children: [{ rowId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc", type: "text", content: "x" }],
      },
      { rowId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd", type: "product", sku: "B" },
    ]);

    await dragRowOnto("items-drag-0", "items-row-1", 0.5);

    expect(hiddenValue("items[1][children][0][type]")).toBeNull();
    expect(hiddenValue("items[0][children][0][type]")).toBe("text");
  });
});

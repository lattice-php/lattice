import { expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import type { ComponentPropsOf, Node } from "@lattice-php/core";
import { fakeNode } from "@lattice-php/core/test-support";
import type { RowTemplateData } from "@lattice-php/form/generated";
import { renderWithForm as wrap } from "@lattice-php/form/test-support";

vi.mock("@lattice-php/core/renderer", async () => {
  const { RenderNode } = await import("@lattice-php/form/test/form-renderer-probe");

  return { RenderNode };
});

import TreeFieldComponent from "./tree-field";

const templates: RowTemplateData[] = [
  {
    type: "product",
    label: "Product",
    schema: [fakeNode({ id: "p", type: "field.text-input", props: { name: "qty" } })],
  },
  {
    type: "text",
    label: "Text",
    schema: [fakeNode({ id: "t", type: "field.textarea", props: { name: "content" } })],
  },
];

function treeNode(props: Partial<ComponentPropsOf<"field.tree">> = {}): Node<"field.tree"> {
  return fakeNode({
    type: "field.tree",
    props: {
      name: "items",
      reorderable: true,
      defaultItems: 0,
      minItems: null,
      maxItems: null,
      maxDepth: 2,
      childBearingTypes: ["product"],
      templates,
      ...props,
    },
  });
}

const nestedValue = {
  items: [
    {
      rowId: "11111111-1111-4111-8111-111111111111",
      type: "product",
      qty: "1",
      children: [
        { rowId: "22222222-2222-4222-8222-222222222222", type: "text", content: "child note" },
      ],
    },
    { rowId: "33333333-3333-4333-8333-333333333333", type: "text", content: "root note" },
  ],
};

it("renders nested rows against their templates with recursive scoped names", () => {
  wrap(<TreeFieldComponent node={treeNode()}>{null}</TreeFieldComponent>, {
    initial: nestedValue,
  });

  const children = screen.getAllByTestId("child");
  expect(children.map((c) => c.textContent)).toEqual([
    "items[0][qty]",
    "items[0][children][0][content]",
    "items[1][content]",
  ]);
});

it("mounts hidden rowId and type inputs at every level", () => {
  const { container } = wrap(<TreeFieldComponent node={treeNode()}>{null}</TreeFieldComponent>, {
    initial: nestedValue,
  });

  const names = [...container.querySelectorAll('input[type="hidden"]')].map((input) =>
    input.getAttribute("name"),
  );
  expect(names).toContain("items[0][rowId]");
  expect(names).toContain("items[0][type]");
  expect(names).toContain("items[0][children][0][rowId]");
  expect(names).toContain("items[0][children][0][type]");
  const childType = container.querySelector('input[name="items[0][children][0][type]"]');
  expect(childType).toHaveValue("text");
});

it("adds a child row of the chosen type through the row's add-child menu", () => {
  wrap(<TreeFieldComponent node={treeNode()}>{null}</TreeFieldComponent>, {
    initial: {
      items: [{ rowId: "11111111-1111-4111-8111-111111111111", type: "product", qty: "1" }],
    },
  });

  fireEvent.click(screen.getByTestId("tree-field-items-add-child-0"));
  fireEvent.click(screen.getByTestId("tree-field-items-add-child-0-text"));

  expect(screen.getAllByTestId("child").map((c) => c.textContent)).toEqual([
    "items[0][qty]",
    "items[0][children][0][content]",
  ]);
});

it("inserts a sibling of the chosen type below the row", () => {
  wrap(<TreeFieldComponent node={treeNode()}>{null}</TreeFieldComponent>, {
    initial: nestedValue,
  });

  fireEvent.click(screen.getByTestId("tree-field-items-add-below-0"));
  fireEvent.click(screen.getByTestId("tree-field-items-add-below-0-text"));

  expect(screen.getAllByTestId("child").map((c) => c.textContent)).toEqual([
    "items[0][qty]",
    "items[0][children][0][content]",
    "items[1][content]",
    "items[2][content]",
  ]);
});

it("offers no add-child menu on a type that does not accept children", () => {
  wrap(<TreeFieldComponent node={treeNode()}>{null}</TreeFieldComponent>, {
    initial: {
      items: [{ rowId: "33333333-3333-4333-8333-333333333333", type: "text", content: "x" }],
    },
  });

  expect(screen.queryByTestId("tree-field-items-add-child-0")).not.toBeInTheDocument();

  fireEvent.click(screen.getByTestId("builder-add"));
  fireEvent.click(screen.getByTestId("builder-add-product"));
  expect(screen.getAllByTestId("child").map((c) => c.textContent)).toContain("items[1][qty]");
});

it("offers no add-child menu at the maximum depth", () => {
  wrap(<TreeFieldComponent node={treeNode({ maxDepth: 1 })}>{null}</TreeFieldComponent>, {
    initial: {
      items: [{ rowId: "11111111-1111-4111-8111-111111111111", type: "product", qty: "1" }],
    },
  });

  expect(screen.queryByTestId("tree-field-items-add-child-0")).not.toBeInTheDocument();
});

it("removes a nested row without touching its siblings", () => {
  wrap(<TreeFieldComponent node={treeNode()}>{null}</TreeFieldComponent>, {
    initial: nestedValue,
  });

  fireEvent.click(screen.getByTestId("tree-field-items.0.children-remove-0"));

  expect(screen.getAllByTestId("child").map((c) => c.textContent)).toEqual([
    "items[0][qty]",
    "items[1][content]",
  ]);
});

it("moves a row within its siblings via the reorder buttons", () => {
  wrap(<TreeFieldComponent node={treeNode()}>{null}</TreeFieldComponent>, {
    initial: nestedValue,
  });

  fireEvent.click(screen.getByTestId("tree-field-items-down-0"));

  const children = screen.getAllByTestId("child");
  expect(children.map((c) => c.textContent)).toEqual([
    "items[0][content]",
    "items[1][qty]",
    "items[1][children][0][content]",
  ]);
});

it("locks all structural affordances when read-only", () => {
  wrap(<TreeFieldComponent node={treeNode({ readOnly: true })}>{null}</TreeFieldComponent>, {
    initial: nestedValue,
  });

  expect(screen.getAllByTestId("child").length).toBe(3);
  expect(screen.queryByTestId("builder-add")).not.toBeInTheDocument();
  expect(screen.queryByTestId("tree-field-items-add-child-0")).not.toBeInTheDocument();
  expect(screen.queryByTestId("tree-field-items-add-below-0")).not.toBeInTheDocument();
  expect(screen.queryByTestId("tree-field-items-remove-0")).not.toBeInTheDocument();
  expect(screen.queryByTestId("tree-field-items-drag-0")).not.toBeInTheDocument();
  expect(screen.queryByTestId("tree-field-items-down-0")).not.toBeInTheDocument();
});

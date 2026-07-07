import { expect, it } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import { fakeNode } from "@lattice-php/lattice/test-support";
import {
  collectPrefillTargets,
  getPath,
  pathsToClear,
  pruneOverrides,
  seededOverrides,
} from "./prefill-targets";

function priceField(): Node {
  return fakeNode({
    id: "f1",
    type: "field.text",
    props: {
      name: "price",
      editablePrefill: true,
      prefillResetOn: ["product"],
      prefillRefreshOn: ["@customer"],
    },
  });
}

function builderNode(): Node {
  return {
    id: "b1",
    type: "field.builder",
    props: { name: "items" },
    blocks: [{ type: "product", label: "Product", schema: [priceField()] }],
  } as unknown as Node;
}

function nestedRepeaterNode(): Node {
  return fakeNode({
    id: "r1",
    type: "field.repeater",
    props: { name: "sections" },
    schema: [
      fakeNode({
        id: "r2",
        type: "field.repeater",
        props: { name: "lines" },
        schema: [priceField()],
      }),
    ],
  });
}

it("collects a concrete target per row, mapping bare and @ deps", () => {
  const values = {
    items: [
      { __rowId: "r-a", type: "product" },
      { __rowId: "r-b", type: "product" },
    ],
  };
  const targets = collectPrefillTargets([builderNode()], values);

  expect(targets).toEqual([
    {
      path: "items.0.price",
      overrideKey: "items.r-a.price",
      resetOn: ["items.0.product"],
      refreshOn: ["customer"],
    },
    {
      path: "items.1.price",
      overrideKey: "items.r-b.price",
      resetOn: ["items.1.product"],
      refreshOn: ["customer"],
    },
  ]);
});

it("collects a top-level target with form-level deps", () => {
  const node = fakeNode({
    id: "t",
    type: "field.text",
    props: { name: "total", editablePrefill: true, prefillRefreshOn: ["@customer"] },
  });

  expect(collectPrefillTargets([node], {})).toEqual([
    { path: "total", overrideKey: "total", resetOn: [], refreshOn: ["customer"] },
  ]);
});

it("ignores rows whose block type is unknown", () => {
  const values = { items: [{ type: "mystery" }] };
  expect(collectPrefillTargets([builderNode()], values)).toEqual([]);
});

it("collects targets recursively through nested row collections", () => {
  const values = {
    customer: "vip",
    sections: [
      {
        __rowId: "section-a",
        lines: [{ __rowId: "line-a", product: "sku-1" }],
      },
    ],
  };

  expect(collectPrefillTargets([nestedRepeaterNode()], values)).toEqual([
    {
      path: "sections.0.lines.0.price",
      overrideKey: "sections.section-a.lines.line-a.price",
      resetOn: ["sections.0.lines.0.product"],
      refreshOn: ["customer"],
    },
  ]);
});

it("reads nested row paths", () => {
  const values: Record<string, unknown> = { items: [{ type: "product", price: 1 }] };

  expect(getPath(values, "items.0.price")).toBe(1);
});

it("clears targets whose resetOn dependency changed", () => {
  const targets = [
    {
      path: "items.0.price",
      overrideKey: "items.r-a.price",
      resetOn: ["items.0.product"],
      refreshOn: [],
    },
  ];
  const prev = { items: [{ product: "a" }] };
  const next = { items: [{ product: "b" }] };

  expect(pathsToClear({ targets, values: prev }, { targets, values: next })).toEqual([
    "items.r-a.price",
  ]);
  expect(pathsToClear({ targets, values: prev }, { targets, values: prev })).toEqual([]);
});

it("keeps reset comparisons attached to the same row after reindexing", () => {
  const previousTargets = [
    {
      path: "items.0.price",
      overrideKey: "items.r-a.price",
      resetOn: ["items.0.product"],
      refreshOn: [],
    },
    {
      path: "items.1.price",
      overrideKey: "items.r-b.price",
      resetOn: ["items.1.product"],
      refreshOn: [],
    },
  ];
  const currentTargets = [
    {
      path: "items.0.price",
      overrideKey: "items.r-b.price",
      resetOn: ["items.0.product"],
      refreshOn: [],
    },
  ];

  expect(
    pathsToClear(
      {
        targets: previousTargets,
        values: { items: [{ product: "alpha" }, { product: "beta" }] },
      },
      {
        targets: currentTargets,
        values: { items: [{ product: "beta" }] },
      },
    ),
  ).toEqual([]);

  expect(
    pathsToClear(
      {
        targets: previousTargets,
        values: { items: [{ product: "alpha" }, { product: "beta" }] },
      },
      {
        targets: currentTargets,
        values: { items: [{ product: "gamma" }] },
      },
    ),
  ).toEqual(["items.r-b.price"]);
});

it("seeds overrides for targets that already hold a stored value", () => {
  const targets = [
    { path: "items.0.price", overrideKey: "items.r-a.price", resetOn: [], refreshOn: [] },
    { path: "items.1.price", overrideKey: "items.r-b.price", resetOn: [], refreshOn: [] },
  ];
  const values = { items: [{ price: 12 }, {}] };

  expect(seededOverrides(targets, values)).toEqual(["items.r-a.price"]);
});

it("prunes stale override keys", () => {
  const targets = [
    { path: "items.0.price", overrideKey: "items.r-b.price", resetOn: [], refreshOn: [] },
  ];

  expect(pruneOverrides(new Set(["items.r-b.price", "items.r-z.price"]), targets)).toEqual(
    new Set(["items.r-b.price"]),
  );
});

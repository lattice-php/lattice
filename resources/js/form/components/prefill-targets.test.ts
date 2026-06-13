import { expect, it } from "vitest";
import type { Node } from "@lattice/lattice/core/types";
import {
  applyPrefillValue,
  collectPrefillTargets,
  getPath,
  pathsToClear,
  pruneOverrides,
  seededOverrides,
  targetByPath,
} from "./prefill-targets";

function priceField(): Node {
  return {
    id: "f1",
    type: "form.text",
    props: {
      name: "price",
      prefill: true,
      prefillResetOn: ["product"],
      prefillRefreshOn: ["@customer"],
    },
  } as unknown as Node;
}

function builderNode(): Node {
  return {
    id: "b1",
    type: "form.builder",
    props: { name: "items" },
    blocks: [{ type: "product", label: "Product", schema: [priceField()] }],
  } as unknown as Node;
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
  const node = {
    id: "t",
    type: "form.text",
    props: { name: "total", prefill: true, prefillRefreshOn: ["@customer"] },
  } as unknown as Node;

  expect(collectPrefillTargets([node], {})).toEqual([
    { path: "total", overrideKey: "total", resetOn: [], refreshOn: ["customer"] },
  ]);
});

it("ignores rows whose block type is unknown", () => {
  const values = { items: [{ type: "mystery" }] };
  expect(collectPrefillTargets([builderNode()], values)).toEqual([]);
});

it("reads and applies nested row paths", () => {
  const values: Record<string, unknown> = { items: [{ type: "product", price: 1 }] };
  expect(getPath(values, "items.0.price")).toBe(1);

  const writes: Array<[string, unknown]> = [];
  const setValue = (name: string, value: unknown) => {
    const next =
      typeof value === "function" ? (value as (p: unknown) => unknown)(values[name]) : value;
    writes.push([name, next]);
  };
  applyPrefillValue(setValue, "items.0.price", 9.5);

  expect(writes[0][0]).toBe("items");
  expect((writes[0][1] as Array<Record<string, unknown>>)[0].price).toBe(9.5);
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

  expect(pathsToClear(targets, prev, targets, next)).toEqual(["items.r-a.price"]);
  expect(pathsToClear(targets, prev, targets, prev)).toEqual([]);
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
      previousTargets,
      { items: [{ product: "alpha" }, { product: "beta" }] },
      currentTargets,
      { items: [{ product: "beta" }] },
    ),
  ).toEqual([]);

  expect(
    pathsToClear(
      previousTargets,
      { items: [{ product: "alpha" }, { product: "beta" }] },
      currentTargets,
      { items: [{ product: "gamma" }] },
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

it("indexes targets by positional path while pruning by override key", () => {
  const targets = [
    { path: "items.0.price", overrideKey: "items.r-b.price", resetOn: [], refreshOn: [] },
  ];

  expect(targetByPath(targets).get("items.0.price")?.overrideKey).toBe("items.r-b.price");
  expect(pruneOverrides(new Set(["items.r-b.price", "items.r-z.price"]), targets)).toEqual(
    new Set(["items.r-b.price"]),
  );
});

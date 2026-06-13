import { expect, it } from "vitest";
import type { Node } from "@lattice/lattice/core/types";
import {
  applyPrefillValue,
  collectPrefillTargets,
  getPath,
  pathsToClear,
  seededOverrides,
} from "./prefill-targets";

function priceField(): Node {
  return {
    id: "f1",
    type: "form.text",
    props: { name: "price", prefill: true, prefillResetOn: ["product"], prefillRefreshOn: ["@customer"] },
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
  const values = { items: [{ type: "product" }, { type: "product" }] };
  const targets = collectPrefillTargets([builderNode()], values);

  expect(targets).toEqual([
    { path: "items.0.price", resetOn: ["items.0.product"], refreshOn: ["customer"] },
    { path: "items.1.price", resetOn: ["items.1.product"], refreshOn: ["customer"] },
  ]);
});

it("collects a top-level target with form-level deps", () => {
  const node = {
    id: "t",
    type: "form.text",
    props: { name: "total", prefill: true, prefillRefreshOn: ["@customer"] },
  } as unknown as Node;

  expect(collectPrefillTargets([node], {})).toEqual([
    { path: "total", resetOn: [], refreshOn: ["customer"] },
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
    const next = typeof value === "function" ? (value as (p: unknown) => unknown)(values[name]) : value;
    writes.push([name, next]);
  };
  applyPrefillValue(setValue, "items.0.price", 9.5);

  expect(writes[0][0]).toBe("items");
  expect((writes[0][1] as Array<Record<string, unknown>>)[0].price).toBe(9.5);
});

it("clears targets whose resetOn dependency changed", () => {
  const targets = [{ path: "items.0.price", resetOn: ["items.0.product"], refreshOn: [] }];
  const prev = { items: [{ product: "a" }] };
  const next = { items: [{ product: "b" }] };

  expect(pathsToClear(targets, prev, next)).toEqual(["items.0.price"]);
  expect(pathsToClear(targets, prev, prev)).toEqual([]);
});

it("seeds overrides for targets that already hold a stored value", () => {
  const targets = [
    { path: "items.0.price", resetOn: [], refreshOn: [] },
    { path: "items.1.price", resetOn: [], refreshOn: [] },
  ];
  const values = { items: [{ price: 12 }, {}] };

  expect(seededOverrides(targets, values)).toEqual(["items.0.price"]);
});

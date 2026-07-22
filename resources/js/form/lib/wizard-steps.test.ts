import { describe, expect, it } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import {
  firstErroredStep,
  stepFieldNames,
  stepsWithErrors,
  stepValidationPaths,
} from "./wizard-steps";

const node = (type: string, props: Record<string, unknown>, schema: Node[] = []): Node =>
  ({ type, props, schema }) as unknown as Node;

const customerStep = node("wizard-step", { name: "customer" }, [
  node("field.text-input", { name: "name" }),
  node("section", {}, [node("field.text-input", { name: "email" })]),
]);

const itemsStep = node("wizard-step", { name: "items" }, [
  node("field.repeater", { name: "items" }, [
    node("field.text-input", { name: "sku" }),
    node("field.number-input", { name: "qty" }),
  ]),
  node("field.select", { name: "tags" }),
]);

describe("stepFieldNames", () => {
  it("collects field names through nested containers", () => {
    expect(stepFieldNames(customerStep)).toEqual(["name", "email"]);
  });

  it("does not descend into row-field children", () => {
    expect(stepFieldNames(itemsStep)).toEqual(["items", "tags"]);
  });
});

describe("stepValidationPaths", () => {
  it("emits the name and a wildcard item pattern for every plain field", () => {
    expect(stepValidationPaths(customerStep)).toEqual(["name", "name.*", "email", "email.*"]);
  });

  it("emits wildcard row patterns for row fields without descending further", () => {
    expect(stepValidationPaths(itemsStep)).toEqual([
      "items",
      "items.*",
      "items.*.sku",
      "items.*.qty",
      "tags",
      "tags.*",
    ]);
  });
});

describe("error partitioning", () => {
  const stepNames = [
    ["name", "email"],
    ["items", "tags"],
  ];

  it("maps error keys to their owning steps by name prefix", () => {
    expect(stepsWithErrors(stepNames, { "items.0.sku": "Required", email: "Invalid" })).toEqual(
      new Set([0, 1]),
    );
  });

  it("ignores cleared errors and unknown keys", () => {
    expect(stepsWithErrors(stepNames, { email: undefined, other: "x" })).toEqual(new Set());
  });

  it("returns the first errored step or null", () => {
    expect(firstErroredStep(stepNames, { "items.0.sku": "Required" })).toBe(1);
    expect(firstErroredStep(stepNames, {})).toBeNull();
  });
});

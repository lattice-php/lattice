import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { evaluateConditions } from "./conditions";

type CoercionRow = {
  actual: unknown;
  expected: boolean;
  result: boolean;
};

const rows = JSON.parse(
  readFileSync("tests/Fixtures/condition-boolean-coercion.json", "utf8"),
) as CoercionRow[];

describe("condition boolean coercion", () => {
  it.each(rows)("$actual == $expected -> $result", ({ actual, expected, result }) => {
    const state = evaluateConditions(
      { visible: [{ field: "field", operator: "eq", value: expected }] },
      { field: actual },
      {},
    );

    expect(state.hidden).toBe(!result);
  });
});

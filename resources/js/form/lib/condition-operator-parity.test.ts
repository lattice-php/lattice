import { readFileSync } from "node:fs";
import type { Op } from "@lattice-php/lattice/types/generated";
import { describe, expect, it } from "vitest";
import { evaluateConditions } from "./conditions";

type ParityRow = {
  operator: Op;
  actual: unknown;
  expected: unknown;
  result: boolean;
};

const rows = JSON.parse(
  readFileSync("tests/Fixtures/condition-operator-parity.json", "utf8"),
) as ParityRow[];

describe("condition operator parity", () => {
  it.each(rows)(
    "$operator: $actual / $expected -> $result",
    ({ operator, actual, expected, result }) => {
      const state = evaluateConditions(
        { visible: [{ field: "field", operator, value: expected }] },
        { field: actual },
        {},
      );

      expect(state.hidden).toBe(!result);
    },
  );
});

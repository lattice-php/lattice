import { describe, expect, it } from "vitest";
import { evaluateConditions } from "./conditions";

describe("evaluateConditions", () => {
  it("hides when a visible condition fails", () => {
    const result = evaluateConditions(
      { visible: [{ field: "type", operator: "=", value: "business" }] },
      { type: "personal" },
      {},
    );
    expect(result.hidden).toBe(true);
  });

  it("shows and requires when conditions match", () => {
    const result = evaluateConditions(
      {
        visible: [{ field: "type", operator: "=", value: "business" }],
        required: [{ field: "type", operator: "=", value: "business" }],
      },
      { type: "business" },
      {},
    );
    expect(result.hidden).toBe(false);
    expect(result.required).toBe(true);
  });

  it("supports operator and in forms", () => {
    expect(
      evaluateConditions({ visible: [{ field: "age", operator: ">=", value: 18 }] }, { age: "18" }, {})
        .hidden,
    ).toBe(false);
    expect(
      evaluateConditions(
        { disabled: [{ field: "plan", operator: "in", value: ["free", "trial"] }] },
        { plan: "free" },
        {},
      ).disabled,
    ).toBe(true);
  });

  it("honors static flags", () => {
    expect(evaluateConditions(undefined, {}, { hidden: true }).hidden).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { evaluateConditions, type Condition } from "./conditions";

describe("evaluateConditions", () => {
  it("hides when a visible condition fails", () => {
    const result = evaluateConditions(
      { visible: [{ field: "type", operator: "eq", value: "business" }] },
      { type: "personal" },
      {},
    );
    expect(result.hidden).toBe(true);
  });

  it("shows and requires when conditions match", () => {
    const result = evaluateConditions(
      {
        visible: [{ field: "type", operator: "eq", value: "business" }],
        required: [{ field: "type", operator: "eq", value: "business" }],
      },
      { type: "business" },
      {},
    );
    expect(result.hidden).toBe(false);
    expect(result.required).toBe(true);
  });

  it("supports operator and in forms", () => {
    expect(
      evaluateConditions(
        { visible: [{ field: "age", operator: "gte", value: 18 }] },
        { age: "18" },
        {},
      ).hidden,
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

  it("treats an unknown operator as matching so malformed payloads fail open", () => {
    const operator = "unsupported" as unknown as Condition["operator"];
    const result = evaluateConditions(
      { visible: [{ field: "type", operator, value: "x" }] },
      { type: "anything" },
      {},
    );
    expect(result.hidden).toBe(false);
  });
});

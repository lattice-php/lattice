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

  it("supports text and presence operators", () => {
    const shows = (operator: Condition["operator"], value: unknown, fieldValue: unknown) =>
      !evaluateConditions(
        { visible: [{ field: "name", operator, value }] },
        { name: fieldValue },
        {},
      ).hidden;

    expect(shows("contains", "ell", "hello")).toBe(true);
    expect(shows("starts_with", "he", "hello")).toBe(true);
    expect(shows("ends_with", "lo", "hello")).toBe(true);
    expect(shows("empty", null, "")).toBe(true);
    expect(shows("empty", null, "x")).toBe(false);
    expect(shows("filled", null, "x")).toBe(true);
    expect(shows("filled", null, "")).toBe(false);
  });

  it("supports before and after date operators", () => {
    const shows = (operator: Condition["operator"], value: unknown, fieldValue: unknown) =>
      !evaluateConditions(
        { visible: [{ field: "starts_on", operator, value }] },
        { starts_on: fieldValue },
        {},
      ).hidden;

    expect(shows("before", "2024-06-01", "2024-01-01")).toBe(true);
    expect(shows("before", "2024-01-01", "2024-06-01")).toBe(false);
    expect(shows("after", "2024-01-01", "2024-06-01")).toBe(true);
    expect(shows("after", "2024-06-01", "2024-01-01")).toBe(false);
    expect(shows("before", "2024-06-01", "not-a-date")).toBe(false);
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

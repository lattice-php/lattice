import { describe, expect, it } from "vitest";
import { conditionFields, evaluateConditions, type Condition } from "./conditions";

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

  it("disables when a disabled condition matches", () => {
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

  const shows = (operator: Condition["operator"], value: unknown, fieldValue: unknown) =>
    !evaluateConditions({ visible: [{ field: "x", operator, value }] }, { x: fieldValue }, {})
      .hidden;

  it("falls back to string comparison when values are null", () => {
    expect(shows("eq", null, null)).toBe(true);
    expect(shows("eq", "value", undefined)).toBe(false);
  });

  it("wraps a non-array expected value for in and not_in", () => {
    expect(shows("in", "free", "free")).toBe(true);
    expect(shows("not_in", "paid", "free")).toBe(true);
    expect(shows("not_in", ["free", "trial"], "free")).toBe(false);
  });

  it("coerces null actuals to an empty string for text operators", () => {
    expect(shows("contains", "", null)).toBe(true);
    expect(shows("starts_with", "", null)).toBe(true);
    expect(shows("ends_with", "", null)).toBe(true);
  });

  it("treats an invalid date as matching nothing", () => {
    expect(shows("before", "2024-06-01", "not-a-date")).toBe(false);
  });

  it("treats equal dates as neither before nor after", () => {
    expect(shows("before", "2024-01-01", "2024-01-01")).toBe(false);
    expect(shows("after", "2024-01-01", "2024-01-01")).toBe(false);
  });

  it("lists each condition field once in declaration order", () => {
    expect(
      conditionFields({
        visible: [{ field: "type", operator: "eq", value: "business" }],
        required: [{ field: "type", operator: "eq", value: "business" }],
        disabled: [{ field: "status", operator: "neq", value: "archived" }],
      }),
    ).toEqual(["type", "status"]);
  });
});

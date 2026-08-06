import { describe, expect, it } from "vitest";
import { parameterTypeLabel } from "./parameter-schema";

describe("parameterTypeLabel", () => {
  it.each([
    [{ oneOf: [{ type: "string" }, { type: "integer" }] }, "string | integer"],
    [{ anyOf: [{ type: "string" }, { type: "null" }] }, "string | null"],
    [{ allOf: [{ $ref: "#/components/schemas/Filter" }, { type: "object" }] }, "Filter & object"],
  ])("labels composed schemas", (schema, label) => {
    expect(parameterTypeLabel(schema)).toBe(label);
  });
});

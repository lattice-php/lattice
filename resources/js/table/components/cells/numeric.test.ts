import { describe, expect, it } from "vitest";
import { numericValue } from "./numeric";

describe("numericValue", () => {
  it("parses numbers and numeric strings", () => {
    expect(numericValue(42)).toBe(42);
    expect(numericValue("3.5")).toBe(3.5);
  });

  it("returns null for non-numeric values", () => {
    expect(numericValue(null)).toBeNull();
    expect(numericValue(undefined)).toBeNull();
    expect(numericValue("")).toBeNull();
    expect(numericValue("n/a")).toBeNull();
  });
});

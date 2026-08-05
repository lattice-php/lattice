import { describe, expect, it } from "vitest";
import { normalizeToastMessage } from "./toast";

describe("normalizeToastMessage", () => {
  it("accepts a plain string message", () => {
    expect(normalizeToastMessage({ message: "Hi" })?.message).toBe("Hi");
  });

  it("rejects an empty string message", () => {
    expect(normalizeToastMessage({ message: "" })).toBeNull();
  });

  it("accepts a Translatable message instead of dropping it", () => {
    const message = { key: "orders.created", payload: {}, replacements: { name: "X" } };
    expect(normalizeToastMessage({ message })?.message).toEqual(message);
  });

  it("rejects a malformed (non-string, non-translatable) message", () => {
    expect(normalizeToastMessage({ message: 42 })).toBeNull();
  });
});

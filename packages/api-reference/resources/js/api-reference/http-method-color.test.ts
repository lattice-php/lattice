import { describe, expect, it } from "vitest";
import { httpMethodColor } from "./http-method-color";

describe("httpMethodColor", () => {
  it.each([
    ["GET", "info"],
    ["POST", "success"],
    ["PUT", "warning"],
    ["PATCH", "warning"],
    ["DELETE", "danger"],
    ["OPTIONS", "default"],
  ] as const)("maps %s to %s", (method, color) => {
    expect(httpMethodColor(method)).toBe(color);
  });
});

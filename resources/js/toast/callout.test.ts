import { describe, expect, it } from "vitest";
import { normalizeCallout } from "./callout";

describe("normalizeCallout", () => {
  it("coerces a raw effect detail into a Callout", () => {
    const callout = normalizeCallout({
      variant: "warning",
      title: "Trial",
      message: "Ends soon",
      dismissible: false,
    });

    expect(callout).toEqual({
      variant: "warning",
      title: "Trial",
      message: "Ends soon",
      dismissible: false,
      action: null,
    });
  });

  it("returns null when the message is missing", () => {
    expect(normalizeCallout({ variant: "info" })).toBeNull();
  });

  it("defaults variant and dismissible", () => {
    const callout = normalizeCallout({ message: "Hi" });
    expect(callout?.variant).toBe("info");
    expect(callout?.dismissible).toBe(true);
  });
});

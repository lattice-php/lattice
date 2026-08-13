import { describe, expect, it } from "vitest";
import { registry } from "./registry";

describe("lattice component registry", () => {
  it("registers every domain's components eagerly", () => {
    const types = [
      "badge",
      "link",
      "chart",
      "action",
      "action.group",
      "form",
      "field.text-input",
      "field.rich-editor",
      "field.date-input",
      "table",
      "notifications",
    ] as const;

    for (const type of types) {
      expect(registry.components[type]?.mode).toBe("eager");
    }
  });

  it("overrides the redirect and reload-page effects with SPA handlers", () => {
    expect(registry.extensions.effects).toMatchObject({
      redirect: expect.any(Function),
      "reload-page": expect.any(Function),
    });
  });
});

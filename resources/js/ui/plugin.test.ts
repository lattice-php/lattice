import { describe, expect, it } from "vitest";
import { coreComponents } from "./plugin";

describe("core component plugin", () => {
  it("registers chart eagerly — it splits Recharts from inside the component", () => {
    expect(coreComponents.components?.chart?.mode).toBe("eager");
  });
});

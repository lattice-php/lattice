import { describe, expect, it } from "vitest";
import { uiComponents } from "./plugin";

describe("ui component plugin", () => {
  it("registers chart eagerly — it splits Recharts from inside the component", () => {
    expect(uiComponents.components?.chart?.mode).toBe("eager");
  });
});

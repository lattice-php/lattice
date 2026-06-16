import { describe, expect, it } from "vitest";
import { coreComponents } from "./index";

describe("core component plugin", () => {
  it("registers chart as a lazy renderer component", async () => {
    const chart = coreComponents.components?.chart;

    expect(chart?.mode).toBe("lazy");

    if (chart === undefined || chart.mode !== "lazy") {
      throw new Error("Expected chart to be registered lazily.");
    }

    await expect(chart.load()).resolves.toHaveProperty("default");
  });
});

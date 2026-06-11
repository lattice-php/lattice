import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSuffixMap, parseTokens } from "./tokens";

const css = readFileSync(resolve(process.cwd(), "resources/css/lattice.css"), "utf8");
const tokenRegistry = parseTokens(css);
const suffixMap = parseSuffixMap(css);

describe("theme tokens", () => {
  it("parses every lt token from the real stylesheet", () => {
    expect(tokenRegistry.find((t) => t.name === "--lt-primary")).toBeDefined();
    expect(tokenRegistry.find((t) => t.name === "--lt-radius-sm")?.category).toBe("radius");
  });

  it("defines --lt-warning for both themes (regression: it was undefined)", () => {
    const warning = tokenRegistry.find((t) => t.name === "--lt-warning");
    expect(warning).toBeDefined();
    expect(warning?.light).toBeTruthy();
    expect(warning?.dark).toBeTruthy();
    expect(suffixMap["lt-warning"]).toBe("--lt-warning");
  });
});

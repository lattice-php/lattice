import { describe, expect, it } from "vitest";
import { buildEndpoint } from "./query";
import type { TableState } from "./types";

function state(overrides: Partial<TableState>): TableState {
  return { filters: [], sorts: [], page: 1, perPage: 25, tableFilters: {}, ...overrides };
}

describe("buildEndpoint with table filters", () => {
  it("serializes a scalar table filter as tf[key]", () => {
    const endpoint = buildEndpoint("/t", state({ tableFilters: { status: "active" } }));

    expect(endpoint).toContain("tf%5Bstatus%5D=active");
  });

  it("serializes a multi-value table filter as repeated tf[key][]", () => {
    const endpoint = buildEndpoint("/t", state({ tableFilters: { status: ["active", "draft"] } }));

    expect(endpoint).toContain("tf%5Bstatus%5D%5B%5D=active");
    expect(endpoint).toContain("tf%5Bstatus%5D%5B%5D=draft");
  });

  it("serializes an object table filter as tf[key][subkey]", () => {
    const endpoint = buildEndpoint(
      "/t",
      state({ tableFilters: { created: { from: "2026-01-01" } } }),
    );

    expect(endpoint).toContain("tf%5Bcreated%5D%5Bfrom%5D=2026-01-01");
  });

  it("omits empty table filter values", () => {
    const endpoint = buildEndpoint(
      "/t",
      state({ tableFilters: { status: "", created: { from: "", until: "" } } }),
    );

    expect(endpoint).not.toContain("tf%5B");
  });
});

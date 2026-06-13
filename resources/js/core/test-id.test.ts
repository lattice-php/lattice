import { describe, expect, it } from "vitest";
import {
  leafTestIdentity,
  nodeIdentity,
  prefixedNodeTestId,
  prefixedTestId,
  testIdentity,
} from "./test-id";

describe("test id helpers", () => {
  it("uses explicit node keys before component ids", () => {
    expect(nodeIdentity({ key: "create-product", id: "workbench.products.create" })).toBe(
      "create-product",
    );
  });

  it("builds prefixed selectors from namespaced ids", () => {
    expect(prefixedTestId("action", "workbench.products.archive")).toBe("action-archive");
    expect(prefixedNodeTestId("menu", { key: "products", id: "ignored" })).toBe("menu-products");
  });

  it("keeps field names as their selector identity", () => {
    expect(testIdentity("price")).toBe("price");
    expect(leafTestIdentity("workbench.products.form")).toBe("form");
  });
});

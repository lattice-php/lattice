import { describe, expect, it } from "vitest";
import { nodeIdentity, prefixedNodeTestId, prefixedTestId, testIdentity } from "./test-id";

describe("test id helpers", () => {
  it("uses explicit node keys before component ids", () => {
    expect(nodeIdentity({ key: "create-product", id: "workbench.products.create" })).toBe(
      "create-product",
    );
  });

  it("builds prefixed selectors from the full namespaced identity", () => {
    expect(prefixedTestId("action", "workbench.products.archive")).toBe(
      "action-workbench.products.archive",
    );
    expect(prefixedNodeTestId("menu", { key: "products", id: "ignored" })).toBe("menu-products");
  });

  it("distinguishes sibling identities that only differ by a shared suffix", () => {
    expect(prefixedTestId("collapsible-toggle", "criterion-1.1.2")).toBe(
      "collapsible-toggle-criterion-1.1.2",
    );
    expect(prefixedTestId("collapsible-toggle", "criterion-3.2.2")).toBe(
      "collapsible-toggle-criterion-3.2.2",
    );
  });

  it("keeps field names as their selector identity", () => {
    expect(testIdentity("price")).toBe("price");
  });
});

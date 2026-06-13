import { describe, expect, it } from "vitest";
import {
  fieldTestId,
  leafTestIdentity,
  nodeTestId,
  prefixedNodeTestId,
  prefixedTestId,
} from "./test-id";

describe("test id helpers", () => {
  it("uses explicit node keys before component ids", () => {
    expect(nodeTestId({ key: "create-product", id: "workbench.products.create" })).toBe(
      "create-product",
    );
  });

  it("builds prefixed selectors from namespaced ids", () => {
    expect(prefixedTestId("action", "workbench.products.archive")).toBe("action-archive");
    expect(prefixedNodeTestId("menu", { key: "products", id: "ignored" })).toBe("menu-products");
  });

  it("keeps field names as their selector identity", () => {
    expect(fieldTestId("price")).toBe("price");
    expect(leafTestIdentity("workbench.products.form")).toBe("form");
  });
});

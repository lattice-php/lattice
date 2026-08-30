import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { claimUrlSyncScope, writeQueryToUrl } from "./url-sync";

describe("writeQueryToUrl", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/products");
  });

  it("writes the owned params onto the url", () => {
    writeQueryToUrl(
      { page: 2, q: "acme" },
      { key: null, ownedKeys: ["filter", "sort", "q", "page", "per_page", "tf"] },
    );

    expect(window.location.search).toBe("?page=2&q=acme");
  });

  it("preserves a foreign param owned by another component", () => {
    window.history.replaceState({}, "", "/products?tabs=details");

    writeQueryToUrl(
      { q: "acme" },
      { key: null, ownedKeys: ["filter", "sort", "q", "page", "per_page", "tf"] },
    );

    const params = new URLSearchParams(window.location.search);

    expect(params.get("tabs")).toBe("details");
    expect(params.get("q")).toBe("acme");
  });

  it("removes an owned param that is no longer present", () => {
    window.history.replaceState({}, "", "/products?q=acme&page=2");

    writeQueryToUrl(
      { q: "acme" },
      { key: null, ownedKeys: ["filter", "sort", "q", "page", "per_page", "tf"] },
    );

    expect(window.location.search).toBe("?q=acme");
  });

  it("removes owned tf[...] params along with the scalar keys", () => {
    window.history.replaceState({}, "", "/products?tf[status][value]=active&q=acme");

    writeQueryToUrl(
      {},
      { key: null, ownedKeys: ["filter", "sort", "q", "page", "per_page", "tf"] },
    );

    expect(window.location.search).toBe("");
  });

  it("nests owned params under the scope key when prefixed", () => {
    writeQueryToUrl(
      { q: "acme", tf: { status: { value: "active" } } },
      { key: "products", ownedKeys: ["filter", "sort", "q", "page", "per_page", "tf"] },
    );

    const params = new URLSearchParams(window.location.search);

    expect(params.get("products[q]")).toBe("acme");
    expect(params.get("products[tf][status][value]")).toBe("active");
  });

  it("touches only its own prefixed namespace, leaving other scopes alone", () => {
    window.history.replaceState({}, "", "/products?a[q]=x&b[q]=y");

    writeQueryToUrl({ q: "z" }, { key: "a", ownedKeys: ["q", "tf"] });

    const params = new URLSearchParams(window.location.search);

    expect(params.get("a[q]")).toBe("z");
    expect(params.get("b[q]")).toBe("y");
  });

  it("preserves window.history.state", () => {
    window.history.replaceState({ page: "custom" }, "", "/products");

    writeQueryToUrl({ q: "acme" }, { key: null, ownedKeys: ["q"] });

    expect(window.history.state).toEqual({ page: "custom" });
  });

  it("skips the history write when the resulting search is unchanged", () => {
    window.history.replaceState({}, "", "/products?q=acme");
    const replaceState = vi.spyOn(window.history, "replaceState");

    writeQueryToUrl({ q: "acme" }, { key: null, ownedKeys: ["q"] });

    expect(replaceState).not.toHaveBeenCalled();
    replaceState.mockRestore();
  });
});

describe("claimUrlSyncScope", () => {
  const originalDev = import.meta.env.DEV;

  beforeEach(() => {
    import.meta.env.DEV = true;
  });

  afterEach(() => {
    import.meta.env.DEV = originalDev;
    vi.restoreAllMocks();
  });

  it("does not warn for a single claimant", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const release = claimUrlSyncScope({ key: null, ownedKeys: ["q"] }, "component-a");

    expect(error).not.toHaveBeenCalled();
    release();
  });

  it("warns once when two components claim the same scope", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const releaseA = claimUrlSyncScope({ key: "products", ownedKeys: ["q"] }, "component-a");
    const releaseB = claimUrlSyncScope({ key: "products", ownedKeys: ["q"] }, "component-b");

    expect(error).toHaveBeenCalledTimes(1);

    releaseA();
    releaseB();
  });

  it("releasing a claim lets a later claimant reuse the scope without warning", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const releaseA = claimUrlSyncScope({ key: "sole", ownedKeys: ["q"] }, "component-a");
    releaseA();

    const releaseB = claimUrlSyncScope({ key: "sole", ownedKeys: ["q"] }, "component-b");

    expect(error).not.toHaveBeenCalled();
    releaseB();
  });
});

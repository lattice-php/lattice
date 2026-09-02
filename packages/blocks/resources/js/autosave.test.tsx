import { jsonResponse, stubFetch } from "@lattice-php/core/test-support";
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAutosave } from "./autosave";
import { createEditorStore, updateData, type EditorStore } from "./document/store";
import { block, document, testTypes } from "./test-support";

function Harness({ store }: { store: EditorStore }) {
  useAutosave(store, { ref: "ref", url: "/lattice/block-editors/pages" }, 200);

  return null;
}

async function flushPromises() {
  await vi.advanceTimersByTimeAsync(0);
}

describe("useAutosave", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("saves the draft once after the debounce and records the new revision", async () => {
    vi.useFakeTimers();
    const fetch = stubFetch(jsonResponse({ errors: { h: { text: ["Required"] } }, revision: 4 }));
    const store = createEditorStore({
      document: document(block("h", "lattice.heading", { text: "" })),
      rendered: {},
      revision: 3,
      types: testTypes,
    });

    render(<Harness store={store} />);
    store.setState((state) => updateData(state, "h", "text", "a"));
    store.setState((state) => updateData(state, "h", "text", "ab"));

    expect(store.getState().saveState).toBe("dirty");
    await vi.advanceTimersByTimeAsync(250);
    await flushPromises();

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/lattice/block-editors/pages");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(String(init.body))).toMatchObject({ revision: 3 });
    expect(store.getState()).toMatchObject({
      errors: { h: { text: ["Required"] } },
      revision: 4,
      saveState: "saved",
    });
  });

  it("marks a conflict on 409 and stops saving until reloaded", async () => {
    vi.useFakeTimers();
    const fetch = stubFetch(jsonResponse({ message: "stale", revision: 9 }, { status: 409 }));
    const store = createEditorStore({
      document: document(block("h", "lattice.heading")),
      rendered: {},
      revision: 1,
      types: testTypes,
    });

    render(<Harness store={store} />);
    store.setState((state) => updateData(state, "h", "text", "x"));
    await vi.advanceTimersByTimeAsync(250);
    await flushPromises();

    expect(store.getState().saveState).toBe("conflict");
    expect(store.getState().revision).toBe(9);

    store.setState((state) => updateData(state, "h", "text", "y"));
    await vi.advanceTimersByTimeAsync(250);
    await flushPromises();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("flushes immediately when the page hides", async () => {
    vi.useFakeTimers();
    const fetch = stubFetch(jsonResponse({ errors: {}, revision: 2 }));
    const store = createEditorStore({
      document: document(block("h", "lattice.heading")),
      rendered: {},
      revision: 1,
      types: testTypes,
    });

    render(<Harness store={store} />);
    store.setState((state) => updateData(state, "h", "text", "x"));
    Object.defineProperty(globalThis.document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    globalThis.document.dispatchEvent(new Event("visibilitychange"));
    await flushPromises();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect((fetch.mock.calls[0] as [string, RequestInit])[1].keepalive).toBe(true);
    Object.defineProperty(globalThis.document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
  });
});

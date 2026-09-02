import { jsonResponse } from "@lattice-php/core/test-support";
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createEditorStore, insert, type EditorStore } from "../../document/store";
import { block, document, testTypes, textFrame } from "../../test-support";
import type { BlockNode } from "../../types";
import { useRenderQueue } from "./use-render-queue";

function Harness({ store }: { store: EditorStore }) {
  useRenderQueue(store, { ref: "ref", url: "/lattice/block-editors/pages" }, 50);

  return null;
}

function stubRenderEndpoint() {
  const fetch = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? "{}")) as { block: BlockNode };

    return jsonResponse({
      errors: { text: ["Required"] },
      node: textFrame(body.block, `Rendered ${body.block.id}`),
    });
  });

  vi.stubGlobal("fetch", fetch);

  return fetch;
}

describe("useRenderQueue", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("renders a newly inserted block once and stores its node and errors", async () => {
    vi.useFakeTimers();
    const fetch = stubRenderEndpoint();
    const store = createEditorStore({
      document: document(block("h", "lattice.heading")),
      rendered: {},
      revision: 1,
      types: testTypes,
    });

    render(<Harness store={store} />);
    let created = "";
    store.setState((state) => {
      const result = insert(state, "lattice.paragraph", { index: 1, parentId: null, slot: null });
      created = result.id ?? "";

      return result.state;
    });

    await vi.advanceTimersByTimeAsync(100);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(
      JSON.parse(String((fetch.mock.calls[0] as [string, RequestInit])[1].body)),
    ).toMatchObject({ _op: "render", block: { id: created } });
    expect(store.getState().rendered[created]?.props).toMatchObject({ blockId: created });
    expect(store.getState().errors[created]).toEqual({ text: ["Required"] });
    expect(store.getState().staleIds).toEqual([]);
  });
});

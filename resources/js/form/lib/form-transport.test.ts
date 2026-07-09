import { afterEach, describe, expect, it, vi } from "vitest";
import { ROW_ID_KEY } from "../components/fields/repeater-rows";
import { postFormAction } from "./form-transport";

describe("postFormAction", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the payload including row ids", async () => {
    const fetchMock = vi.fn<typeof fetch>(() =>
      Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 })),
    );
    vi.stubGlobal("fetch", fetchMock);

    await postFormAction(
      "/forms/products",
      "component-ref",
      {
        _search: "items.0.product",
        q: "desk",
        items: [{ [ROW_ID_KEY]: "9f3cf7c2-6c2e-4f0e-9c1a-0e1a2b3c4d5e", category: "chairs" }],
      },
      new AbortController().signal,
    );

    const body = fetchMock.mock.calls[0]?.[1]?.body;

    expect(JSON.parse(String(body))).toEqual({
      _search: "items.0.product",
      q: "desk",
      items: [{ [ROW_ID_KEY]: "9f3cf7c2-6c2e-4f0e-9c1a-0e1a2b3c4d5e", category: "chairs" }],
    });
  });
});

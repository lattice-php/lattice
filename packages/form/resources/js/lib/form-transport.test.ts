import { describe, expect, it, vi } from "vitest";
import { ROW_ID_KEY } from "@lattice-php/form/components/fields/repeater-rows";
import { postFormAction } from "./form-transport";

describe("postFormAction", () => {
  it("sends the payload including row ids", async () => {
    const fetchMock = vi.fn<typeof fetch>(() =>
      Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 })),
    );
    vi.stubGlobal("fetch", fetchMock);

    await postFormAction(
      "/forms/products",
      "component-ref",
      {
        _sub: "search",
        _target: "items.0.product",
        _q: "desk",
        items: [{ [ROW_ID_KEY]: "9f3cf7c2-6c2e-4f0e-9c1a-0e1a2b3c4d5e", category: "chairs" }],
      },
      new AbortController().signal,
    );

    const body = fetchMock.mock.calls[0]?.[1]?.body;

    expect(JSON.parse(String(body))).toEqual({
      _sub: "search",
      _target: "items.0.product",
      _q: "desk",
      items: [{ [ROW_ID_KEY]: "9f3cf7c2-6c2e-4f0e-9c1a-0e1a2b3c4d5e", category: "chairs" }],
    });
  });
});

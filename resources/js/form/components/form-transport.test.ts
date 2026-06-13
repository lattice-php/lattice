import { afterEach, describe, expect, it, vi } from "vitest";
import { ROW_ID_KEY } from "./fields/repeater-rows";
import { postFormAction } from "./form-transport";

describe("postFormAction", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("strips client row ids from JSON payloads", async () => {
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
        items: [
          {
            [ROW_ID_KEY]: "r1",
            category: "chairs",
            product: "",
            children: [{ [ROW_ID_KEY]: "r2", name: "Nested" }],
          },
        ],
      },
      new AbortController().signal,
    );

    const body = fetchMock.mock.calls[0]?.[1]?.body;

    expect(JSON.parse(String(body))).toEqual({
      _search: "items.0.product",
      q: "desk",
      items: [
        {
          category: "chairs",
          product: "",
          children: [{ name: "Nested" }],
        },
      ],
    });
  });
});

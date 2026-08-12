import { vi } from "vitest";
import type { SearchResponse, SearchResult } from "./types";

export function searchResponse(
  data: SearchResult[],
  options: {
    category?: string | null;
    categories?: SearchResponse["categories"];
    hasMore?: boolean;
    mode?: SearchResponse["state"]["mode"];
    nextPage?: number | null;
    page?: number;
  } = {},
): SearchResponse {
  return {
    data,
    categories: options.categories ?? [],
    pagination: {
      page: options.page ?? 1,
      perPage: 20,
      total: data.length,
      hasMore: options.hasMore ?? false,
      nextPage: options.nextPage ?? null,
    },
    state: {
      query: "",
      category: options.category ?? null,
      perPage: 20,
      countsIncluded: false,
      mode: options.mode ?? "results",
    },
  };
}

export function stubSearchFetch(
  handler: (url: URL, init: RequestInit | undefined) => Response | Promise<Response>,
) {
  const fetch = vi.fn<typeof globalThis.fetch>(async (input, init) => {
    const value = input instanceof Request ? input.url : input.toString();

    return handler(new URL(value, window.location.origin), init);
  });

  vi.stubGlobal("fetch", fetch);

  return fetch;
}

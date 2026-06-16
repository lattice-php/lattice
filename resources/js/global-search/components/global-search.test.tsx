import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GlobalSearch from "./global-search";

afterEach(() => vi.unstubAllGlobals());

function renderRoot() {
  const node = {
    type: "global-search.root",
    props: {
      endpoint: "/lattice/global-search",
      placeholder: "Search…",
      title: "Search",
      shortcut: true,
      perPage: 20,
    },
  } as never;

  return render(<GlobalSearch node={node}>{null}</GlobalSearch>);
}

describe("GlobalSearch root", () => {
  it("opens on Cmd+K and shows the default composition", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(
        async () =>
          new Response(
            JSON.stringify({
              data: [],
              categories: [],
              pagination: { page: 1, perPage: 20, total: 0, hasMore: false, nextPage: null },
              state: { query: "", category: null, perPage: 20, countsIncluded: true },
            }),
            { status: 200 },
          ),
      ),
    );
    renderRoot();

    fireEvent.keyDown(window, { key: "k", metaKey: true });

    await waitFor(() => expect(screen.getByRole("searchbox")).toBeInTheDocument());
  });

  it("ignores the shortcut while typing in an input", () => {
    renderRoot();
    const external = document.createElement("input");
    document.body.appendChild(external);
    external.focus();

    fireEvent.keyDown(external, { key: "k", metaKey: true });

    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    external.remove();
  });
});

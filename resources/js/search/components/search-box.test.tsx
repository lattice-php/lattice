import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SearchBox from "./search-box";

afterEach(() => vi.unstubAllGlobals());

const emptyPayload = JSON.stringify({
  data: [],
  categories: [],
  pagination: { page: 1, perPage: 20, total: 0, hasMore: false, nextPage: null },
  state: { query: "", category: null, perPage: 20, countsIncluded: true },
});

function renderRoot() {
  const node = {
    type: "search.box",
    props: {
      endpoint: "/lattice/search",
      placeholder: "Search…",
      title: "Search",
      shortcut: true,
      perPage: 20,
    },
  } as never;

  return render(<SearchBox node={node}>{null}</SearchBox>);
}

describe("SearchBox root", () => {
  it("opens on Cmd+K and shows the default composition", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async () => new Response(emptyPayload, { status: 200 })),
    );
    renderRoot();

    fireEvent.keyDown(window, { key: "k", metaKey: true });

    await waitFor(() => expect(screen.getByRole("searchbox")).toBeInTheDocument());
  });

  it("fires the recent=1 request exactly once when opened (no render loop)", async () => {
    vi.useRealTimers();

    const fetchMock = vi.fn<typeof fetch>(async () => new Response(emptyPayload, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    renderRoot();

    fireEvent.keyDown(window, { key: "k", metaKey: true });

    // Wait for the dialog to appear and the initial fetch to settle.
    await waitFor(() => expect(screen.getByRole("searchbox")).toBeInTheDocument());

    // Give any potential loop iterations time to run.
    await new Promise((resolve) => setTimeout(resolve, 100));

    const recentCalls = fetchMock.mock.calls.filter((c) => String(c[0]).includes("recent=1"));

    expect(recentCalls).toHaveLength(1);
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

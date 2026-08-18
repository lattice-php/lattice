import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CollapsedContext } from "@lattice-php/core/collapsed-context";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import { fakeNode, jsonResponse } from "@lattice-php/core/test-support";
import { defaultNavigation, NavigationProvider } from "@lattice-php/ui/navigation";
import { withModalHost } from "@lattice-php/ui/test/modal-host";
import SearchBox from "./components/search-box";
import { searchResponse, stubSearchFetch } from "./test-support";
import type { SearchBox as SearchBoxNode, SearchResult } from "./types";

function dispatchNavigateClose(): void {
  act(() => {
    window.dispatchEvent(new CustomEvent(LATTICE_EVENT.closeModal, { detail: { modal: null } }));
  });
}

const visit = vi.fn<(url: string) => void>();

const deskLamp: SearchResult = {
  category: { name: "products" },
  item: {
    id: "1",
    title: "Desk Lamp",
    link: "/products?q=Desk+Lamp",
    subtitle: "LAMP-1",
    additionalInfo: null,
    badge: null,
  },
};

const officeChair: SearchResult = {
  category: { name: "products" },
  item: {
    id: "2",
    title: "Office Chair",
    link: "/products?q=Office+Chair",
    subtitle: "CHAIR-2",
    additionalInfo: null,
    badge: null,
  },
};

function renderSearch(props: Partial<SearchBoxNode> = {}) {
  const node = fakeNode({
    type: "search.box",
    id: "global-search",
    props: { endpoint: "/lattice/search", perPage: 20, shortcut: true, ...props },
  });

  return render(
    <NavigationProvider adapter={{ ...defaultNavigation, visit }}>
      {withModalHost(<SearchBox node={node}>{null}</SearchBox>)}
    </NavigationProvider>,
  );
}

beforeEach(() => {
  visit.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it("debounces a query and switches result categories", async () => {
  const categories = [
    { name: "products", label: "Products", icon: "package", count: 1 },
    { name: "partners", label: "Partners", icon: "users", count: 1 },
  ];
  const partner: SearchResult = {
    category: { name: "partners" },
    item: {
      id: "1",
      title: "Ada Lovelace",
      link: "/partners?q=Ada",
      subtitle: "ada@example.com",
      additionalInfo: null,
      badge: null,
    },
  };
  stubSearchFetch((url) => {
    if (url.searchParams.has("recent")) {
      return jsonResponse(searchResponse([], { mode: "recent" }));
    }

    return url.searchParams.get("category") === "partners"
      ? jsonResponse(searchResponse([partner], { category: "partners", categories }))
      : jsonResponse(searchResponse([deskLamp], { category: "products", categories }));
  });
  renderSearch();

  fireEvent.click(screen.getByTestId("search-trigger"));
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "desk" } });

  expect(await screen.findByRole("option", { name: /Desk Lamp/ })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /Partners/ }));

  expect(await screen.findByRole("option", { name: /Ada Lovelace/ })).toBeInTheDocument();
  expect(screen.queryByRole("option", { name: /Desk Lamp/ })).not.toBeInTheDocument();
});

it("opens the keyboard-focused result only after the server re-resolves it", async () => {
  const fetch = stubSearchFetch((url, init) => {
    if (init?.method === "POST") {
      return jsonResponse({
        data: { ...officeChair, item: { ...officeChair.item, link: "/safe" } },
        state: { recorded: true },
      });
    }

    return url.searchParams.has("recent")
      ? jsonResponse(searchResponse([], { mode: "recent" }))
      : jsonResponse(searchResponse([deskLamp, officeChair], { category: "products" }));
  });
  renderSearch();

  fireEvent.click(screen.getByTestId("search-trigger"));
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "office" } });

  const input = screen.getByRole("searchbox");
  await screen.findByRole("listbox");
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "Enter" });

  await waitFor(() => expect(visit).toHaveBeenCalledWith("/safe"));
  const selection = fetch.mock.calls.find(([, init]) => init?.method === "POST");
  expect(selection?.[1]?.body).toBe(JSON.stringify({ category: "products", id: "2" }));
});

it("opens compact and expands the result grid once a query is typed", async () => {
  stubSearchFetch((url) => {
    if (url.searchParams.has("recent")) {
      return jsonResponse(searchResponse([], { mode: "recent" }));
    }

    return jsonResponse(searchResponse([deskLamp], { category: "products" }));
  });
  renderSearch();

  fireEvent.click(screen.getByTestId("search-trigger"));

  expect(screen.getByRole("searchbox")).toBeInTheDocument();
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "desk" } });

  expect(await screen.findByRole("option", { name: /Desk Lamp/ })).toBeInTheDocument();
  expect(screen.getByRole("listbox")).toBeInTheDocument();

  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "" } });

  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
});

it("renders an icon-only trigger inside a collapsed container", () => {
  stubSearchFetch(() => jsonResponse(searchResponse([], { mode: "recent" })));
  const node = fakeNode({
    type: "search.box",
    id: "global-search",
    props: { endpoint: "/lattice/search", perPage: 20, shortcut: true },
  });

  render(
    <NavigationProvider adapter={{ ...defaultNavigation, visit }}>
      {withModalHost(
        <CollapsedContext.Provider value={true}>
          <SearchBox node={node}>{null}</SearchBox>
        </CollapsedContext.Provider>,
      )}
    </NavigationProvider>,
  );

  const trigger = screen.getByTestId("search-trigger");
  expect(trigger).toHaveAccessibleName("Search…");
  expect(trigger).not.toHaveTextContent("Search…");
  expect(trigger).not.toHaveTextContent("⌘K");

  fireEvent.click(trigger);

  expect(screen.getByRole("searchbox")).toBeInTheDocument();
});

it("appends the next result page", async () => {
  stubSearchFetch((url) => {
    if (url.searchParams.has("recent")) {
      return jsonResponse(searchResponse([], { mode: "recent" }));
    }

    return url.searchParams.get("page") === "2"
      ? jsonResponse(searchResponse([officeChair], { category: "products", page: 2 }))
      : jsonResponse(
          searchResponse([deskLamp], {
            category: "products",
            hasMore: true,
            nextPage: 2,
          }),
        );
  });
  renderSearch();

  fireEvent.click(screen.getByTestId("search-trigger"));
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "office" } });
  fireEvent.click(await screen.findByRole("button", { name: "Load more" }));

  expect(await screen.findByRole("option", { name: /Office Chair/ })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: /Desk Lamp/ })).toBeInTheDocument();
});

it("closes the palette once the framework's navigate listener dispatches the close-modal event", async () => {
  stubSearchFetch((url, init) => {
    if (init?.method === "POST") {
      return jsonResponse({
        data: { ...officeChair, item: { ...officeChair.item, link: "/safe" } },
        state: { recorded: true },
      });
    }

    return url.searchParams.has("recent")
      ? jsonResponse(searchResponse([], { mode: "recent" }))
      : jsonResponse(searchResponse([officeChair], { category: "products" }));
  });
  renderSearch();

  fireEvent.click(screen.getByTestId("search-trigger"));
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "office" } });
  fireEvent.click(await screen.findByRole("option", { name: /Office Chair/ }));

  await waitFor(() => expect(visit).toHaveBeenCalledWith("/safe"));
  expect(screen.getByRole("dialog")).toBeInTheDocument();

  dispatchNavigateClose();

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("lets a fresh trigger click reopen the palette after a navigate close", async () => {
  stubSearchFetch(() => jsonResponse(searchResponse([], { mode: "recent" })));
  renderSearch();

  fireEvent.click(screen.getByTestId("search-trigger"));
  expect(screen.getByRole("dialog")).toBeInTheDocument();

  dispatchNavigateClose();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

  // The host clears the entry's close handle once Radix's exit animation
  // settles (onCloseAutoFocus), which runs on its own rAF-scheduled tick even
  // in jsdom — retry the trigger click until the handle is free again.
  await waitFor(() => {
    fireEvent.click(screen.getByTestId("search-trigger"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

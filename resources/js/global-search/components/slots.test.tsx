import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GlobalSearchProvider } from "../context";
import type { SearchResult, UseGlobalSearchReturn } from "../types";
import GlobalSearchCategories from "./categories";
import GlobalSearchInput from "./input";
import GlobalSearchRecent from "./recent";

function row(id: string): SearchResult {
  return { category: { name: "products" }, item: { id, title: "Widget " + id, subtitle: null, additionalInfo: null, link: "/p/" + id, badge: null } };
}

function value(overrides: Partial<UseGlobalSearchReturn> = {}): UseGlobalSearchReturn {
  return {
    query: "", setQuery: vi.fn(), categories: [{ name: "products", label: "Products", icon: "package", count: 3 }],
    activeCategory: "products", setCategory: vi.fn(), results: [], recent: [], pagination: null,
    status: "idle", error: null, focusedId: null, setFocusedId: vi.fn(), loadMore: vi.fn(), openResult: vi.fn(), refreshRecent: vi.fn(),
    ...overrides,
  };
}

function node(type: string) {
  return { type, props: {} } as never;
}

describe("global-search slots", () => {
  it("input forwards typing to setQuery", () => {
    const v = value();
    render(<GlobalSearchProvider value={v}><GlobalSearchInput node={node("global-search.input")}>{null}</GlobalSearchInput></GlobalSearchProvider>);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "wid" } });
    expect(v.setQuery).toHaveBeenCalledWith("wid");
  });

  it("categories render label + count and select on click", () => {
    const v = value();
    render(<GlobalSearchProvider value={v}><GlobalSearchCategories node={node("global-search.categories")}>{null}</GlobalSearchCategories></GlobalSearchProvider>);
    fireEvent.click(screen.getByRole("button", { name: /Products/ }));
    expect(v.setCategory).toHaveBeenCalledWith("products");
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("recent hides while a query is active", () => {
    const { container } = render(
      <GlobalSearchProvider value={value({ query: "wid", recent: [row("1")] })}>
        <GlobalSearchRecent node={node("global-search.recent")}>{null}</GlobalSearchRecent>
      </GlobalSearchProvider>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchProvider } from "../context";
import type { SearchResult, UseSearchReturn } from "../types";
import SearchCategories from "./categories";
import SearchInput from "./input";
import SearchRecent from "./recent";

function row(id: string): SearchResult {
  return {
    category: { name: "products" },
    item: {
      id,
      title: "Widget " + id,
      subtitle: null,
      additionalInfo: null,
      link: "/p/" + id,
      badge: null,
    },
  };
}

function value(overrides: Partial<UseSearchReturn> = {}): UseSearchReturn {
  return {
    query: "",
    setQuery: vi.fn<(value: string) => void>(),
    categories: [{ name: "products", label: "Products", icon: "package", count: 3 }],
    activeCategory: "products",
    setCategory: vi.fn<(name: string | null) => void>(),
    results: [],
    recent: [],
    pagination: null,
    status: "idle",
    error: null,
    focusedId: null,
    setFocusedId: vi.fn<(id: string | null) => void>(),
    loadMore: vi.fn<() => void>(),
    openResult: vi.fn<(result: SearchResult) => void>(),
    refreshRecent: vi.fn<() => void>(),
    ...overrides,
  };
}

function node(type: string) {
  return { type, props: {} } as never;
}

describe("search slots", () => {
  it("input forwards typing to setQuery", () => {
    const v = value();
    render(
      <SearchProvider value={v}>
        <SearchInput node={node("search.input")}>{null}</SearchInput>
      </SearchProvider>,
    );
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "wid" } });
    expect(v.setQuery).toHaveBeenCalledWith("wid");
  });

  it("categories render label + count and select on click", () => {
    const v = value();
    render(
      <SearchProvider value={v}>
        <SearchCategories node={node("search.categories")}>{null}</SearchCategories>
      </SearchProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Products/ }));
    expect(v.setCategory).toHaveBeenCalledWith("products");
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("recent hides while a query is active", () => {
    const { container } = render(
      <SearchProvider value={value({ query: "wid", recent: [row("1")] })}>
        <SearchRecent node={node("search.recent")}>{null}</SearchRecent>
      </SearchProvider>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

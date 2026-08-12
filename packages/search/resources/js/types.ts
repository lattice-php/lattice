import type { ComponentPropsMap } from "./generated";

declare module "@lattice-php/core" {
  interface ComponentProps extends ComponentPropsMap {}
}

export type {
  NodeType as SearchNodeType,
  RecordSelectionResponse,
  RecordSelectionState,
  SearchBox,
  SearchCategory,
  SearchMode,
  SearchPagination,
  SearchResponse,
  SearchResult,
  SearchResultCategory,
  SearchResultItem,
  SearchState,
} from "./generated";

export const SEARCH_DEBOUNCE_MS = 250;

export type SearchStatus = "idle" | "loading" | "success" | "error";

export type UseSearchOptions = {
  endpoint: string;
  perPage?: number;
};

export type UseSearchReturn = {
  query: string;
  setQuery: (value: string) => void;
  categories: import("./generated").SearchCategory[];
  activeCategory: string | null;
  setCategory: (name: string) => void;
  results: import("./generated").SearchResult[];
  recent: import("./generated").SearchResult[];
  pagination: import("./generated").SearchPagination | null;
  status: SearchStatus;
  error: string | null;
  focusedKey: string | null;
  setFocusedKey: (key: string | null) => void;
  loadMore: () => void;
  openResult: (result: import("./generated").SearchResult) => void;
  refreshRecent: () => void;
};

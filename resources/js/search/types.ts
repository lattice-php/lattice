export const SEARCH_DEBOUNCE_MS = 250;

export type SearchResult = {
  category: { name: string };
  item: {
    id: string;
    title: string;
    subtitle: string | null;
    additionalInfo: string | null;
    link: string;
    badge: string | null;
  };
};

export type SearchCategory = {
  name: string;
  label: string;
  icon: string | null;
  count: number | null;
};
export type SearchPagination = {
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
  nextPage: number | null;
};

export type SearchState = {
  query: string;
  category: string | null;
  perPage: number;
  countsIncluded: boolean;
  mode: string;
};
export type SearchResponse = {
  data: SearchResult[];
  categories: SearchCategory[];
  pagination: SearchPagination;
  state: SearchState;
};
export type RecordResponse = { data: SearchResult | null; state: { recorded: boolean } };

export type SearchStatus = "idle" | "loading" | "success" | "error";
export type UseSearchOptions = { endpoint: string; perPage?: number };

export type UseSearchReturn = {
  query: string;
  setQuery: (value: string) => void;
  categories: SearchCategory[];
  activeCategory: string | null;
  setCategory: (name: string | null) => void;
  results: SearchResult[];
  recent: SearchResult[];
  pagination: SearchPagination | null;
  status: SearchStatus;
  error: string | null;
  focusedId: string | null;
  setFocusedId: (id: string | null) => void;
  loadMore: () => void;
  openResult: (result: SearchResult) => void;
  refreshRecent: () => void;
};

export { default as searchPlugin } from "./plugin";
export { default as SearchBox } from "./components/search-box";
export { default as SearchCategories } from "./components/categories";
export { default as SearchInput } from "./components/input";
export { default as SearchPreview } from "./components/preview";
export { default as SearchRecent } from "./components/recent";
export { default as SearchResults } from "./components/results";
export { SearchProvider, useSearchContext } from "./context";
export { searchResultKey, useSearch } from "./use-search";
export type {
  RecordSelectionResponse,
  SearchCategory,
  SearchMode,
  SearchPagination,
  SearchResponse,
  SearchResult,
  SearchState,
  SearchStatus,
  UseSearchOptions,
  UseSearchReturn,
} from "./types";

import { createPlugin, eagerComponent } from "@lattice-php/lattice/core/registry";
import SearchBox from "./components/search-box";
import SearchCategories from "./components/categories";
import SearchInput from "./components/input";
import SearchPreview from "./components/preview";
import SearchRecent from "./components/recent";
import SearchResults from "./components/results";

export const searchComponents = createPlugin({
  name: "lattice/search",
  components: {
    "search.box": eagerComponent(SearchBox),
    "search.input": eagerComponent(SearchInput),
    "search.categories": eagerComponent(SearchCategories),
    "search.results": eagerComponent(SearchResults),
    "search.recent": eagerComponent(SearchRecent),
    "search.preview": eagerComponent(SearchPreview),
  },
});

export { default as SearchBox } from "./components/search-box";
export { default as SearchInput } from "./components/input";
export { default as SearchCategories } from "./components/categories";
export { default as SearchResults } from "./components/results";
export { default as SearchRecent } from "./components/recent";
export { default as SearchPreview } from "./components/preview";
export { SearchProvider, useSearchContext } from "./context";
export { useSearch } from "./use-search";
export type {
  SearchResult,
  SearchCategory,
  SearchPagination,
  SearchResponse,
  RecordResponse,
  SearchStatus,
  UseSearchOptions,
  UseSearchReturn,
} from "./types";

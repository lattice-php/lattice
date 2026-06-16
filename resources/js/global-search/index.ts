import { createPlugin, eagerComponent } from "@lattice-php/lattice/core/registry";
import GlobalSearch from "./components/global-search";
import GlobalSearchCategories from "./components/categories";
import GlobalSearchInput from "./components/input";
import GlobalSearchPreview from "./components/preview";
import GlobalSearchRecent from "./components/recent";
import GlobalSearchResults from "./components/results";

export const globalSearchPlugin = createPlugin({
  name: "global-search",
  components: {
    "global-search.root": eagerComponent(GlobalSearch),
    "global-search.input": eagerComponent(GlobalSearchInput),
    "global-search.categories": eagerComponent(GlobalSearchCategories),
    "global-search.results": eagerComponent(GlobalSearchResults),
    "global-search.recent": eagerComponent(GlobalSearchRecent),
    "global-search.preview": eagerComponent(GlobalSearchPreview),
  },
});

export { default as GlobalSearch } from "./components/global-search";
export { default as GlobalSearchInput } from "./components/input";
export { default as GlobalSearchCategories } from "./components/categories";
export { default as GlobalSearchResults } from "./components/results";
export { default as GlobalSearchRecent } from "./components/recent";
export { default as GlobalSearchPreview } from "./components/preview";
export { GlobalSearchProvider, useGlobalSearchContext } from "./context";
export { useGlobalSearch } from "./use-global-search";
export type {
  SearchResult,
  SearchCategory,
  SearchPagination,
  SearchResponse,
  RecordResponse,
  GlobalSearchStatus,
  UseGlobalSearchOptions,
  UseGlobalSearchReturn,
} from "./types";

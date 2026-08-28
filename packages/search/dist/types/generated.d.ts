export type ComponentPropsMap = {
  "search.box": SearchBox;
  "search.categories": SearchCategories;
  "search.input": SearchInput;
  "search.preview": SearchPreview;
  "search.recent": SearchRecent;
  "search.results": SearchResults;
};
export type NodeType =
  | "search.box"
  | "search.categories"
  | "search.input"
  | "search.preview"
  | "search.recent"
  | "search.results";
export type RecordSelectionResponse = {
  readonly data: SearchResult;
  readonly state: RecordSelectionState;
};
export type RecordSelectionState = {
  readonly recorded: boolean;
};
export type SearchBox = {
  endpoint: string;
  perPage: number;
  placeholder: string | null;
  shortcut: boolean;
  title: string | null;
};
export type SearchCategories = Record<string, never>;
export type SearchCategory = {
  readonly count: number | null;
  readonly icon: string | null;
  readonly label: string;
  readonly name: string;
};
export type SearchInput = Record<string, never>;
export type SearchMode = "results" | "recent";
export type SearchNodeType =
  | "search.box"
  | "search.categories"
  | "search.input"
  | "search.preview"
  | "search.recent"
  | "search.results";
export type SearchPagination = {
  readonly hasMore: boolean;
  readonly nextPage: number | null;
  readonly page: number;
  readonly perPage: number;
  readonly total: number;
};
export type SearchPreview = Record<string, never>;
export type SearchRecent = Record<string, never>;
export type SearchResponse = {
  readonly categories: SearchCategory[];
  readonly data: SearchResult[];
  readonly pagination: SearchPagination;
  readonly state: SearchState;
};
export type SearchResult = {
  readonly category: SearchResultCategory;
  readonly item: SearchResultItem;
};
export type SearchResultCategory = {
  readonly name: string;
};
export type SearchResultItem = {
  readonly additionalInfo: string | null;
  readonly badge: string | null;
  readonly id: string;
  readonly link: string;
  readonly subtitle: string | null;
  readonly title: string;
};
export type SearchResults = Record<string, never>;
export type SearchState = {
  readonly category: string | null;
  readonly countsIncluded: boolean;
  readonly mode: SearchMode;
  readonly perPage: number;
  readonly query: string;
};

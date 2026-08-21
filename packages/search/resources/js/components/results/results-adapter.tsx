import type { RendererComponent } from "@lattice-php/core/types";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { SearchResults } from "./results";

export const SearchResultsAdapter: RendererComponent<"search.results"> = ({ node }) => (
  <SearchResults data-test={nodeIdentity(node)} />
);

export default SearchResultsAdapter;

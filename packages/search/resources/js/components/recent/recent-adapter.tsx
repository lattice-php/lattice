import type { RendererComponent } from "@lattice-php/core/types";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { SearchRecent } from "./recent";

export const SearchRecentAdapter: RendererComponent<"search.recent"> = ({ node }) => (
  <SearchRecent data-test={nodeIdentity(node)} />
);

export default SearchRecentAdapter;

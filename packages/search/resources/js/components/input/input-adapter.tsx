import type { RendererComponent } from "@lattice-php/core/types";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { SearchInput } from "./input";

export const SearchInputAdapter: RendererComponent<"search.input"> = ({ node }) => (
  <SearchInput data-test={nodeIdentity(node)} />
);

export default SearchInputAdapter;

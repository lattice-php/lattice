import type { RendererComponent } from "@lattice-php/core/types";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { SearchCategories } from "./categories";

export const SearchCategoriesAdapter: RendererComponent<"search.categories"> = ({ node }) => (
  <SearchCategories data-test={nodeIdentity(node)} />
);

export default SearchCategoriesAdapter;

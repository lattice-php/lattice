import type { RendererComponent } from "@lattice-php/core/types";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { SearchPreview } from "./preview";

export const SearchPreviewAdapter: RendererComponent<"search.preview"> = ({ node }) => (
  <SearchPreview data-test={nodeIdentity(node)} />
);

export default SearchPreviewAdapter;

import { useCollapsed } from "@lattice-php/core/collapsed-context";
import type { RendererComponent } from "@lattice-php/core/types";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { SearchBox } from "./search-box";

export const SearchBoxAdapter: RendererComponent<"search.box"> = ({ node, children }) => {
  const { endpoint, perPage, placeholder, shortcut, title } = node.props;
  const collapsed = useCollapsed();

  return (
    <SearchBox
      collapsed={collapsed}
      data-test={nodeIdentity(node)}
      endpoint={endpoint}
      perPage={perPage}
      placeholder={placeholder}
      shortcut={shortcut}
      title={title}
    >
      {node.schema?.length ? children : undefined}
    </SearchBox>
  );
};

export default SearchBoxAdapter;

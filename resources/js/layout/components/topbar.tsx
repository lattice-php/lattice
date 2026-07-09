import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";
import { cn } from "@lattice-php/lattice/lib/utils";

const TopbarComponent: RendererComponent<"topbar"> = ({ children, node }) => {
  const sticky = node.props.sticky;

  return (
    <header
      data-lattice-component={nodeIdentity(node)}
      className={cn(
        "flex h-14 w-full items-center gap-2 border-b border-lt-border bg-lt-bg px-4 text-lt-fg",
        sticky && "sticky top-0 z-lt-sticky",
      )}
    >
      {children}
    </header>
  );
};

export default TopbarComponent;

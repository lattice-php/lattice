import type { RendererComponent } from "@lattice-php/core/types";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { cn } from "../lib/utils";
import { DescriptionListProvider } from "../entries/context";

const DescriptionListComponent: RendererComponent<"description-list"> = ({ children, node }) => {
  const { bleed, divided, emptyLabel, semantic } = node.props;
  const isDescriptionList = semantic !== "list";
  const identity = nodeIdentity(node);

  const className = cn(
    "w-full",
    divided && "divide-y divide-lt-border",
    // The rows carry the gutter padding, so pulling the list out by the same
    // amount runs the dividers to the panel edge while the content stays put.
    bleed && "-mx-lt-gutter",
  );

  const body =
    children ??
    (emptyLabel ? (
      <p className="px-lt-gutter py-3 text-sm text-lt-muted-fg">{emptyLabel}</p>
    ) : null);

  return (
    <DescriptionListProvider value={isDescriptionList ? "description-list" : "list"}>
      {isDescriptionList ? (
        <dl className={className} data-lattice-component={identity} data-slot="description-list">
          {body}
        </dl>
      ) : (
        <div
          className={className}
          data-lattice-component={identity}
          data-slot="description-list"
          role="list"
        >
          {body}
        </div>
      )}
    </DescriptionListProvider>
  );
};

export default DescriptionListComponent;

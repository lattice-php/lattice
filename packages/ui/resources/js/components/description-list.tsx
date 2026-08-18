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
    // `w-full` pins the width to the containing block's content box, which
    // stops the negative margins below from growing the box — only the left
    // edge would shift outward, since the right edge is `left + width` with a
    // fixed width. `w-auto` lets them expand it on both sides instead, so the
    // divider reaches the panel edge symmetrically (see Separator's bleed).
    bleed && "-mx-lt-gutter w-auto",
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

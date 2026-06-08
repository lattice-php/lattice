import { getStringProp } from "@/lattice/core/props";
import type { LatticeRendererComponent } from "@/lattice/core/types";

declare module "@/lattice/core/types" {
  interface LatticeComponentProps {
    card: {
      body?: string;
      title?: string;
    };
  }
}

const CardComponent: LatticeRendererComponent<"card"> = ({ children, node }) => (
  <article
    data-lattice-component={node.id}
    className="grid min-h-44 gap-4 rounded-lg border bg-card p-6 text-card-foreground shadow-xs"
  >
    <div className="grid content-start gap-2">
      <h2 className="text-lg font-semibold tracking-normal">
        {getStringProp(node.props, "title")}
      </h2>
      <p className="text-sm leading-6 text-muted-foreground">{getStringProp(node.props, "body")}</p>
    </div>
    {children}
  </article>
);

export default CardComponent;

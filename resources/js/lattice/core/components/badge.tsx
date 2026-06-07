import { Badge } from "@/components/ui/badge";
import { getStringProp } from "@/lattice/core/props";
import type { LatticeRendererComponent } from "@/lattice/core/types";

declare module "@/lattice/core/types" {
  interface LatticeComponentProps {
    badge: {
      label?: string;
    };
  }
}

const BadgeComponent: LatticeRendererComponent<"badge"> = ({ node }) => (
  <Badge variant="secondary" className="w-fit px-3 py-1">
    {getStringProp(node.props, "label")}
  </Badge>
);

export default BadgeComponent;

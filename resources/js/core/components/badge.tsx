import { Badge } from "@/components/ui/badge";
import { getStringProp } from "@/lattice/core/props";
import type { RendererComponent } from "@/lattice/core/types";

declare module "@/lattice/core/types" {
  interface ComponentProps {
    badge: {
      label?: string;
    };
  }
}

const BadgeComponent: RendererComponent<"badge"> = ({ node }) => (
  <Badge variant="secondary" className="w-fit px-3 py-1">
    {getStringProp(node.props, "label")}
  </Badge>
);

export default BadgeComponent;

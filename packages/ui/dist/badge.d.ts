import { Color, Node } from '@lattice-php/core/generated';
import * as React from "react";
declare function Badge({ color, className, style, ...props }: Omit<React.ComponentProps<"span">, "color"> & {
    color?: Color | string | null;
}): React.JSX.Element;
declare const BadgeComponent: ({ node }: {
    node: Node<"badge">;
}) => React.JSX.Element;
export default BadgeComponent;
export { Badge };

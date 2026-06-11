import type { RendererComponent } from "@lattice/lattice/core/types";
import { cn } from "@lattice/lattice/lib/utils";

const HeadingComponent: RendererComponent<"heading"> = ({ node }) => {
  const { text } = node.props;
  const level = Math.min(Math.max(node.props.level, 1), 6);
  const className = cn(
    "max-w-3xl font-semibold tracking-normal text-balance text-lt-fg",
    level === 1 && "text-4xl leading-tight sm:text-5xl",
    level === 2 && "text-2xl",
    level > 2 && "text-lg",
  );

  switch (level) {
    case 1:
      return <h1 className={className}>{text}</h1>;
    case 2:
      return <h2 className={className}>{text}</h2>;
    case 3:
      return <h3 className={className}>{text}</h3>;
    case 4:
      return <h4 className={className}>{text}</h4>;
    case 5:
      return <h5 className={className}>{text}</h5>;
    default:
      return <h6 className={className}>{text}</h6>;
  }
};

export default HeadingComponent;

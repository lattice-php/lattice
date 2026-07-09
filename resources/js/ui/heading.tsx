import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { cn } from "@lattice-php/lattice/lib/utils";
import { InfoTooltip } from "./info-tooltip";

const HeadingComponent: RendererComponent<"heading"> = ({ node }) => {
  const { text, tooltip } = node.props;
  const level = Math.min(Math.max(node.props.level, 1), 6);
  const className = cn(
    "max-w-3xl font-semibold tracking-normal text-balance text-lt-fg",
    level === 1 && "text-2xl font-bold leading-tight",
    level === 2 && "text-xl",
    level > 2 && "text-base",
  );

  const content = (
    <>
      {text}
      <InfoTooltip content={tooltip} />
    </>
  );

  switch (level) {
    case 1:
      return <h1 className={className}>{content}</h1>;
    case 2:
      return <h2 className={className}>{content}</h2>;
    case 3:
      return <h3 className={className}>{content}</h3>;
    case 4:
      return <h4 className={className}>{content}</h4>;
    case 5:
      return <h5 className={className}>{content}</h5>;
    default:
      return <h6 className={className}>{content}</h6>;
  }
};

export default HeadingComponent;

import type { ReactNode } from "react";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { cn } from "@lattice-php/lattice/lib/utils";
import { CopyableText } from "./copyable-text";
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

  let heading: ReactNode;

  switch (level) {
    case 1:
      heading = <h1 className={className}>{content}</h1>;
      break;
    case 2:
      heading = <h2 className={className}>{content}</h2>;
      break;
    case 3:
      heading = <h3 className={className}>{content}</h3>;
      break;
    case 4:
      heading = <h4 className={className}>{content}</h4>;
      break;
    case 5:
      heading = <h5 className={className}>{content}</h5>;
      break;
    default:
      heading = <h6 className={className}>{content}</h6>;
  }

  if (!node.props.copyable) {
    return heading;
  }

  return (
    <CopyableText value={text} label={text}>
      {heading}
    </CopyableText>
  );
};

export default HeadingComponent;

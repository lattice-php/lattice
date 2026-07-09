import { Renderer } from "@lattice-php/lattice/core/renderer";
import { toNodes } from "@lattice-php/lattice/core/nodes";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { InfoTooltip } from "./info-tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const TooltipComponent: RendererComponent<"tooltip"> = ({ node }) => {
  const content = node.props.content;
  const trigger = toNodes(node.props.trigger);

  if (!content) {
    return null;
  }

  if (trigger.length === 0) {
    return <InfoTooltip content={content} />;
  }

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        className="inline-flex items-center rounded-lt-sm outline-none focus-visible:ring-lt-ring/50 focus-visible:ring-[3px]"
      >
        <Renderer nodes={trigger} />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="max-w-xs p-3 text-sm [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </Popover>
  );
};

export default TooltipComponent;

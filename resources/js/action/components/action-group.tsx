import * as Popover from "@radix-ui/react-popover";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@lattice/lattice/core/components/button";
import type { RendererComponent } from "@lattice/lattice/core/types";

const ActionGroupComponent: RendererComponent<"action.group"> = ({ children, node }) => {
  const label = node.props.label ?? "Actions";

  return (
    <div className="inline-flex" data-lattice-component={node.id}>
      <Popover.Root>
        <Popover.Trigger asChild>
          <Button
            aria-label={label}
            className="size-8 text-lt-muted-fg shadow-none hover:text-lt-fg"
            size="icon"
            type="button"
            variant="ghost"
          >
            <MoreHorizontal aria-hidden="true" className="size-4" />
          </Button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="end"
            aria-label={label}
            className="z-50 grid min-w-40 gap-1 rounded-lt-sm border border-lt-border bg-lt-popover p-1 text-lt-popover-fg shadow-md [&>button]:w-full [&>button]:justify-start"
            sideOffset={8}
          >
            {children}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
};

export default ActionGroupComponent;

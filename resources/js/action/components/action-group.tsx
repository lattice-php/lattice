import { Icon } from "@lattice-php/lattice/icons";
import * as Popover from "@radix-ui/react-popover";
import { Button } from "@lattice-php/lattice/core/components/button";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { cn } from "@lattice-php/lattice/lib/utils";

const ActionGroupComponent: RendererComponent<"action.group"> = ({ children, node }) => {
  const label = node.props.label;
  const orientation = node.props.orientation;

  if (orientation) {
    return (
      <div
        aria-label={label}
        className={cn(
          "inline-flex max-w-full gap-1",
          orientation === "vertical" ? "flex-col items-stretch" : "flex-row flex-wrap items-center",
        )}
        data-lattice-component={node.id}
        role="group"
      >
        {children}
      </div>
    );
  }

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
            <Icon name="more-horizontal" aria-hidden="true" className="size-lt-icon-md" />
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

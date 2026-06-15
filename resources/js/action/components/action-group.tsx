import { Icon } from "@lattice-php/lattice/icons";
import { Button } from "@lattice-php/lattice/core/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@lattice-php/lattice/core/components/dropdown-menu";
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={label}
            className="size-8 text-lt-muted-fg shadow-none hover:text-lt-fg"
            data-test={nodeIdentity(node)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Icon name="more-horizontal" aria-hidden="true" className="size-lt-icon-md" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          aria-label={label}
          className="[&>button]:w-full [&>button]:justify-start"
          sideOffset={8}
        >
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ActionGroupComponent;

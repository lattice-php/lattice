import { Icon } from "@lattice-php/lattice/icons";
import { Button } from "@lattice-php/lattice/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@lattice-php/lattice/ui/dropdown-menu";
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { cn } from "@lattice-php/lattice/lib/utils";
import { useT } from "@lattice-php/lattice/i18n";
import { ActionMenuProvider } from "@lattice-php/lattice/ui/action-menu-context";

const ActionGroupComponent: RendererComponent<"action.group"> = ({ children, node }) => {
  const { t } = useT("lattice");
  const label = node.props.label ?? t("common.action-group.label", "Actions");
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
            className="size-lt-control-sm text-lt-muted-fg shadow-none hover:text-lt-fg"
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
          className="min-w-44 gap-0.5 p-1.5"
          sideOffset={8}
        >
          <ActionMenuProvider>{children}</ActionMenuProvider>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ActionGroupComponent;

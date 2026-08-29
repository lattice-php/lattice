import type { Node } from "@lattice-php/core";
import { Renderer } from "@lattice-php/core";
import { ActionMenuProvider } from "@lattice-php/ui/action-menu-context";
import { Button } from "@lattice-php/ui/components/button/button";
import { Icon } from "@lattice-php/ui/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@lattice-php/ui/primitives/dropdown-menu";
import { useT } from "@lattice-php/ui/i18n";

export type BoardCardActionsProps = {
  actions: Node[];
  "data-test"?: string;
};

export function BoardCardActions({ actions, "data-test": testId }: BoardCardActionsProps) {
  const { t } = useT("board");
  const label = t("board.card-actions", "Card actions");

  return (
    <div className="lt-board-card-actions" data-test={testId}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={label}
            className="size-lt-control-sm text-lt-muted-fg shadow-none hover:text-lt-fg"
            size="icon"
            type="button"
            emphasis="ghost"
          >
            <Icon aria-hidden="true" className="size-lt-icon-md" name="more-horizontal" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          aria-label={label}
          className="min-w-44 gap-0.5 p-1.5"
          sideOffset={4}
        >
          <ActionMenuProvider>
            <Renderer nodes={actions} />
          </ActionMenuProvider>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

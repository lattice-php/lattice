import type { ReactNode } from "react";
import { ActionMenuProvider } from "@lattice-php/ui/action-menu-context";
import { Button } from "@lattice-php/ui/components/button/button";
import { Icon } from "@lattice-php/ui/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@lattice-php/ui/primitives/dropdown-menu";

export type ActionsDropdownProps = {
  children: ReactNode;
  className?: string;
  "data-test"?: string;
  label: string;
  sideOffset?: number;
};

export function ActionsDropdown({
  children,
  className,
  "data-test": testId,
  label,
  sideOffset = 8,
}: ActionsDropdownProps) {
  return (
    <div className={className ?? "inline-flex"} data-test={testId}>
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
          sideOffset={sideOffset}
        >
          <ActionMenuProvider>{children}</ActionMenuProvider>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

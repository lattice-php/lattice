import { Icon } from "@lattice-php/lattice/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@lattice-php/lattice/ui/dropdown-menu";

export type RowAction = {
  key: string;
  label: string;
  icon: string;
  onClick: () => void;
  destructive?: boolean;
};

function inlineClass(destructive?: boolean): string {
  return destructive
    ? "text-lt-danger hover:text-lt-danger [&_svg]:size-lt-icon-sm"
    : "text-lt-muted-fg hover:text-lt-fg [&_svg]:size-lt-icon-sm";
}

export function RowActions({ actions }: { actions: RowAction[] }) {
  if (actions.length === 0) {
    return null;
  }

  if (actions.length === 1) {
    const action = actions[0];
    return (
      <button
        type="button"
        aria-label={action.label}
        data-test={`row-action-${action.key}`}
        className={inlineClass(action.destructive)}
        onClick={action.onClick}
      >
        <Icon name={action.icon} />
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Actions"
          data-test="row-actions-menu"
          className="text-lt-muted-fg hover:text-lt-fg [&_svg]:size-lt-icon-sm"
        >
          <Icon name="more-horizontal" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.key}
            data-test={`row-action-${action.key}`}
            destructive={action.destructive}
            icon={action.icon}
            onClick={action.onClick}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

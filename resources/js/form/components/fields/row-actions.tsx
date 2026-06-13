import { Icon } from "@lattice-php/lattice/icons";
import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";

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

function menuItemClass(destructive?: boolean): string {
  const base =
    "flex w-full items-center gap-2 rounded-lt-sm px-3 py-1.5 text-left text-sm [&_svg]:size-lt-icon-sm";
  return destructive
    ? `${base} text-lt-danger hover:bg-lt-danger/10`
    : `${base} hover:bg-lt-accent hover:text-lt-accent-fg`;
}

export function RowActions({ actions }: { actions: RowAction[] }) {
  const [open, setOpen] = useState(false);

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
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label="Actions"
          data-test="row-actions-menu"
          className="text-lt-muted-fg hover:text-lt-fg [&_svg]:size-lt-icon-sm"
        >
          <Icon name="more-horizontal" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={4}
          className="z-50 min-w-[10rem] overflow-hidden rounded-lt-sm border border-lt-border bg-lt-bg p-1 shadow-md"
        >
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              data-test={`row-action-${action.key}`}
              className={menuItemClass(action.destructive)}
              onClick={() => {
                action.onClick();
                setOpen(false);
              }}
            >
              <Icon name={action.icon} />
              {action.label}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

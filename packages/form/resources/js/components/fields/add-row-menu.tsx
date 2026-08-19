import { Icon } from "@lattice-php/ui/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@lattice-php/ui/primitives/dropdown-menu";

export type AddRowOption = { type: string; label: string };

/**
 * The default trigger is the labeled add button; `icon` renders a compact
 * icon-only trigger for inline row toolbars. `testId` scopes the trigger and
 * its options when several menus share a screen (default: `builder-add`).
 */
export function AddRowMenu({
  addLabel,
  options,
  onSelect,
  icon,
  testId = "builder-add",
}: {
  addLabel: string;
  options: AddRowOption[];
  onSelect: (type: string) => void;
  icon?: string;
  testId?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {icon ? (
          <button
            type="button"
            aria-label={addLabel}
            title={addLabel}
            data-test={testId}
            className="text-lt-muted-fg hover:text-lt-fg [&_svg]:size-lt-icon-sm"
          >
            <Icon name={icon} />
          </button>
        ) : (
          <button
            type="button"
            data-test={testId}
            className="inline-flex items-center gap-1.5 self-start rounded-lt-sm border border-lt-border px-3 py-1.5 text-sm hover:bg-lt-accent [&_svg]:size-lt-icon-sm"
          >
            <Icon name="plus" />
            {addLabel}
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[12rem]">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.type}
            data-test={`${testId}-${option.type}`}
            onClick={() => onSelect(option.type)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

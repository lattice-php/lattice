import { Icon } from "@lattice-php/lattice/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@lattice-php/lattice/ui/dropdown-menu";

export type AddRowOption = { type: string; label: string };

export function AddRowMenu({
  addLabel,
  options,
  onSelect,
}: {
  addLabel: string;
  options: AddRowOption[];
  onSelect: (type: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-test="builder-add"
          className="inline-flex items-center gap-1.5 self-start rounded-lt-sm border border-lt-border px-3 py-1.5 text-sm hover:bg-lt-accent [&_svg]:size-lt-icon-sm"
        >
          <Icon name="plus" />
          {addLabel}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[12rem]">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.type}
            data-test={`builder-add-${option.type}`}
            onClick={() => onSelect(option.type)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

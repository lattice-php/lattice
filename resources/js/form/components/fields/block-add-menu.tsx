import { Icon } from "@lattice-php/lattice/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@lattice-php/lattice/core/components/dropdown-menu";

export type BlockOption = { type: string; label: string };

export function BlockAddMenu({
  addLabel,
  blocks,
  onSelect,
}: {
  addLabel: string;
  blocks: BlockOption[];
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
        {blocks.map((block) => (
          <DropdownMenuItem
            key={block.type}
            data-test={`builder-add-${block.type}`}
            onClick={() => onSelect(block.type)}
          >
            {block.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

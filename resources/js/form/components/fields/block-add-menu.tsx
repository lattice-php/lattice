import { Icon } from "@lattice-php/lattice/icons";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lattice-php/lattice/core/components/popover";

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
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-test="builder-add"
          className="inline-flex items-center gap-1.5 self-start rounded-lt-sm border border-lt-border px-3 py-1.5 text-sm hover:bg-lt-accent [&_svg]:size-lt-icon-sm"
        >
          <Icon name="plus" />
          {addLabel}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="min-w-[12rem] overflow-hidden p-1">
        {blocks.map((block) => (
          <button
            key={block.type}
            type="button"
            data-test={`builder-add-${block.type}`}
            className="flex w-full items-center rounded-lt-sm px-3 py-1.5 text-left text-sm hover:bg-lt-accent hover:text-lt-accent-fg"
            onClick={() => {
              onSelect(block.type);
              setOpen(false);
            }}
          >
            {block.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

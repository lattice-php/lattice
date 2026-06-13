import { Icon } from "@lattice-php/lattice/icons";
import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";

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
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          data-test="builder-add"
          className="inline-flex items-center gap-1.5 self-start rounded-lt-sm border border-lt-border px-3 py-1.5 text-sm hover:bg-lt-accent [&_svg]:size-lt-icon-sm"
        >
          <Icon name="plus" />
          {addLabel}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-50 min-w-[12rem] overflow-hidden rounded-lt-sm border border-lt-border bg-lt-bg p-1 shadow-md"
        >
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
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

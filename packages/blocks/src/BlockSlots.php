<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use InvalidArgumentException;
use Lattice\Blocks\Components\SlotOutlet;
use Lattice\Ui\Components\Component;

/**
 * The slot outlets a block render places into its layout. Children arrive
 * pre-rendered for the view; the editor renders shallowly and fills each
 * outlet from its own document instead.
 */
final readonly class BlockSlots
{
    /**
     * @param  array<string, SlotData>  $slots
     * @param  array<string, list<Component>>  $rendered
     */
    public function __construct(
        private BlockNode $block,
        private array $slots,
        private array $rendered = [],
    ) {}

    public function render(string $name): SlotOutlet
    {
        $slot = $this->slots[$name] ?? throw new InvalidArgumentException(
            "Block [{$this->block->type}] declares no slot [{$name}].",
        );

        return SlotOutlet::make("{$this->block->id}-{$name}")
            ->blockId($this->block->id)
            ->slot($slot)
            ->schema($this->rendered[$name] ?? []);
    }

    /**
     * @return list<string>
     */
    public function names(): array
    {
        return array_keys($this->slots);
    }
}

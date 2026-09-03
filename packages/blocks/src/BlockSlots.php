<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Illuminate\Support\HtmlString;
use InvalidArgumentException;
use Lattice\Blocks\Components\SlotOutlet;
use Lattice\Ui\Components\Component;

/**
 * The slot outlets a block render places into its layout. Children arrive
 * pre-rendered for the view; the editor renders shallowly and fills each
 * outlet from its own document instead. The HTML renderer hands the children
 * over as markup for {@see html()}.
 */
final readonly class BlockSlots
{
    /**
     * @param  array<string, SlotData>  $slots
     * @param  array<string, list<Component>>  $rendered
     * @param  array<string, list<string>>  $html
     */
    public function __construct(
        private BlockNode $block,
        private array $slots,
        private array $rendered = [],
        private array $html = [],
    ) {}

    public function render(string $name): SlotOutlet
    {
        $slot = $this->slot($name);

        return SlotOutlet::make("{$this->block->id}-{$name}")
            ->blockId($this->block->id)
            ->slot($slot)
            ->schema($this->rendered[$name] ?? []);
    }

    public function html(string $name): HtmlString
    {
        $this->slot($name);

        return new HtmlString(implode('', $this->html[$name] ?? []));
    }

    private function slot(string $name): SlotData
    {
        return $this->slots[$name] ?? throw new InvalidArgumentException(
            "Block [{$this->block->type}] declares no slot [{$name}].",
        );
    }
}

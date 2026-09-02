<?php
declare(strict_types=1);

namespace Lattice\Blocks\Components;

use Lattice\Blocks\SlotData;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\ContainerComponent;

/**
 * Where a layout block's child blocks go. In the view its schema holds the
 * rendered children; in the editor the client fills it from the document.
 */
#[AsComponent('blocks.slot')]
class SlotOutlet extends ContainerComponent
{
    public string $blockId = '';

    public string $name = '';

    public string $label = '';

    /** @var list<string>|null */
    public ?array $allows = null;

    public ?int $min = null;

    public ?int $max = null;

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function blockId(string $blockId): static
    {
        $this->blockId = $blockId;

        return $this;
    }

    public function slot(SlotData $slot): static
    {
        $this->name = $slot->name;
        $this->label = $slot->label;
        $this->allows = $slot->allows;
        $this->min = $slot->min;
        $this->max = $slot->max;

        return $this;
    }
}

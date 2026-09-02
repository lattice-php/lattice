<?php
declare(strict_types=1);

namespace Lattice\Blocks\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\Component;

/**
 * Stands in for a stored block whose type is no longer registered, so the
 * data survives until someone decides what to do with it.
 */
#[AsComponent('blocks.unknown')]
class UnknownBlock extends Component
{
    public string $blockType = '';

    public static function make(string $blockType, ?string $key = null): static
    {
        $component = new static($key);
        $component->blockType = $blockType;

        return $component;
    }
}

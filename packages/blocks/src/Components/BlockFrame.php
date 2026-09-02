<?php
declare(strict_types=1);

namespace Lattice\Blocks\Components;

use Lattice\Blocks\BlockStyle;
use Lattice\Blocks\BlockSupports;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\ContainerComponent;

/**
 * Wraps one rendered block: carries its identity and generic style so the
 * client applies width, spacing, background, and visibility without the block
 * render knowing about any of it.
 */
#[AsComponent('blocks.frame')]
class BlockFrame extends ContainerComponent
{
    public string $blockId = '';

    public string $blockType = '';

    public BlockStyle $style;

    public BlockSupports $supports;

    public function __construct(?string $key = null)
    {
        parent::__construct($key);

        $this->style = BlockStyle::empty();
        $this->supports = BlockSupports::all();
    }

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function block(string $id, string $type): static
    {
        $this->blockId = $id;
        $this->blockType = $type;

        return $this;
    }

    public function style(BlockStyle $style): static
    {
        $this->style = $style;

        return $this;
    }

    public function supports(BlockSupports $supports): static
    {
        $this->supports = $supports;

        return $this;
    }
}

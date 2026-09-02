<?php
declare(strict_types=1);

namespace Lattice\Blocks\Components;

use Lattice\Blocks\BlockDocument;
use Lattice\Blocks\BlockRenderer;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\ContainerComponent;

/**
 * The read-only render of a block document inside a Lattice page.
 */
#[AsComponent('blocks.view')]
class BlockView extends ContainerComponent
{
    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public static function document(BlockDocument $document, ?string $key = null): static
    {
        $view = static::make($key);

        app(BlockRenderer::class)->render($document, $view);

        return $view;
    }
}

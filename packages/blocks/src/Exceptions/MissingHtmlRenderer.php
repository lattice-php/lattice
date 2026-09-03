<?php
declare(strict_types=1);

namespace Lattice\Blocks\Exceptions;

use RuntimeException;

/**
 * Thrown when a document is rendered to HTML and a block in it declares no
 * `html()` while no fallback is configured under `lattice.blocks.html_fallback`.
 */
final class MissingHtmlRenderer extends RuntimeException
{
    public function __construct(public readonly string $blockType)
    {
        parent::__construct(
            "Block [{$blockType}] has no html() renderer. Implement html() on the block or configure lattice.blocks.html_fallback.",
        );
    }
}

<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Lattice\Core\Attributes\TypeScript;

/**
 * The classes a block frame puts on its outer element (spacing, background,
 * visibility, alignment) and its inner element (content width).
 */
#[TypeScript]
final readonly class FrameClasses
{
    public function __construct(
        public string $outer,
        public string $inner,
    ) {}

    public static function none(): self
    {
        return new self('', '');
    }
}

<?php
declare(strict_types=1);

namespace Lattice\Board;

use Lattice\Core\Attributes\TypeScript;
use Lattice\Core\Color;

#[TypeScript]
final readonly class BoardColumnData
{
    public function __construct(
        public string $key,
        public string $label,
        public ?Color $color,
        public ?string $icon,
    ) {}
}

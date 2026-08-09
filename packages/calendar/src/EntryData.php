<?php
declare(strict_types=1);

namespace Lattice\Calendar;

use Lattice\Core\Attributes\TypeScript;
use Lattice\Core\Color;

#[TypeScript]
final readonly class EntryData
{
    public function __construct(
        public string $id,
        public string $resourceId,
        public string $start,
        public string $end,
        public string $label,
        public ?Color $color,
    ) {}
}

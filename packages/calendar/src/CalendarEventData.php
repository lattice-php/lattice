<?php
declare(strict_types=1);

namespace Lattice\Calendar;

use Lattice\Core\Attributes\TypeScript;
use Lattice\Core\Color;

#[TypeScript]
final readonly class CalendarEventData
{
    /**
     * @param  array<string, mixed>  $context
     */
    public function __construct(
        public string $id,
        public string $start,
        public string $end,
        public bool $allDay,
        public string $label,
        public ?string $resourceId,
        public ?Color $color,
        public array $context,
    ) {}
}

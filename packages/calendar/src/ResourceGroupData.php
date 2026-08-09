<?php
declare(strict_types=1);

namespace Lattice\Calendar;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
final readonly class ResourceGroupData
{
    /**
     * @param  list<array{id: string, label: string}>  $resources
     */
    public function __construct(
        public string $key,
        public string $label,
        public array $resources,
    ) {}
}

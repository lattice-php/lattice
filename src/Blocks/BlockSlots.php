<?php
declare(strict_types=1);

namespace Lattice\Lattice\Blocks;

use Lattice\Lattice\Core\Components\Component;

final readonly class BlockSlots
{
    /**
     * @param  array<string, array<int, Component>>  $slots
     */
    public function __construct(private array $slots = []) {}

    /**
     * @return array<int, Component>
     */
    public function get(string $name): array
    {
        return $this->slots[$name] ?? [];
    }
}

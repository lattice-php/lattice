<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Contracts;

use Lattice\Lattice\Ui\Components\Component;

interface SchemaEntry
{
    /**
     * @return array<int, Component>
     */
    public function resolveComponents(): array;
}

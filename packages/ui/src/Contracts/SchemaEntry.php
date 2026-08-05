<?php
declare(strict_types=1);

namespace Lattice\Ui\Contracts;

use Lattice\Ui\Components\Component;

interface SchemaEntry
{
    /**
     * @return array<int, Component>
     */
    public function resolveComponents(): array;
}

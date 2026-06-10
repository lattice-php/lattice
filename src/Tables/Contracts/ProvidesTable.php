<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Contracts;

use Lattice\Lattice\Tables\Columns\Column;

interface ProvidesTable
{
    /**
     * @return array<int, Column>
     */
    public function columns(): array;

    public function source(): TableSource;
}

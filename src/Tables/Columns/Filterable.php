<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables\Columns;

use Bambamboole\Lattice\Tables\Enums\ControlType;
use Bambamboole\Lattice\Tables\Enums\Operator;

interface Filterable
{
    public function isFilterable(): bool;

    public function controlType(): ControlType;

    /**
     * @return array<int, Operator>
     */
    public function filterOperators(): array;

    public function defaultFilterOperator(): Operator;

    /**
     * @return array<string, mixed>
     */
    public function filterToArray(): array;
}

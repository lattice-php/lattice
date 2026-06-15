<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Enums\ColumnType;

#[AsColumn(ColumnType::Number)]
class NumberColumn extends NumericColumn {}

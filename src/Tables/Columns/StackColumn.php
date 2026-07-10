<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\Concerns\HasChildSchema;
use Lattice\Lattice\Core\Enums\ColumnWidth;
use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Enums\ColumnType;

#[AsColumn(ColumnType::Stack)]
class StackColumn extends Column
{
    use HasChildSchema;

    public ColumnWidth $width = ColumnWidth::Xl;

    /**
     * @return array<int, Component>
     */
    public function children(): array
    {
        return $this->children;
    }
}

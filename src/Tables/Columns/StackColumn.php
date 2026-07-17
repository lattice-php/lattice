<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Enums\ColumnType;
use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Components\Concerns\HasChildSchema;
use Lattice\Lattice\Ui\Enums\ColumnWidth;

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

    /**
     * @return array<int, string>
     */
    #[\Override]
    public function boundRowKeys(): array
    {
        $keys = [];

        foreach ($this->children as $child) {
            if (! $child->shouldRender()) {
                continue;
            }

            array_push($keys, ...$child->boundRowKeys());
        }

        return array_values(array_unique($keys));
    }
}

<?php
declare(strict_types=1);

namespace Workbench\App\Tables\Columns;

use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\Concerns\IsFilterable;
use Lattice\Lattice\Tables\Columns\Filterable;

#[AsColumn(type: 'status-badge')]
class StatusBadgeColumn extends Column implements Filterable
{
    use IsFilterable;

    /**
     * @var array<string, string>|null
     */
    public ?array $colorMap = null;

    /**
     * @param  array<string, string>  $colorMap
     */
    public function colorMap(array $colorMap): static
    {
        $this->colorMap = $colorMap === [] ? null : $colorMap;

        return $this;
    }
}

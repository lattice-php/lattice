<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Workbench\App\Models\Product;
use Workbench\App\Tables\Columns\StatusBadgeColumn;

#[AsTable('workbench.demo.custom-column')]
class CustomColumnTable extends BaseProductsDemoTable
{
    /**
     * @return array<int, Column>
     */
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label(__('workbench.tables.columns.name'))->sortable(),
            StatusBadgeColumn::make('status')->label(__('workbench.tables.columns.status'))->filterOptions([
                'draft' => 'Draft',
                'active' => 'Active',
                'archived' => 'Archived',
            ])->colorMap(['draft' => 'gray', 'active' => 'green', 'archived' => 'red']),
        ];
    }

    /**
     * @return Builder<Product>
     */
    protected function query(): Builder
    {
        return Product::query()->select(['id', 'name', 'status']);
    }
}

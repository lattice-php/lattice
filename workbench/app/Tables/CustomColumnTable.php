<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Lattice\Tables\TableQuery;
use Workbench\App\Models\Product;
use Workbench\App\Tables\Columns\StatusBadgeColumn;

/**
 * @extends EloquentTableDefinition<Product>
 */
#[AsTable('workbench.demo.custom-column')]
class CustomColumnTable extends EloquentTableDefinition
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
    public function builder(TableQuery $query): Builder
    {
        $builder = Product::query()->select(['id', 'name', 'status']);

        if ($query->sorts === []) {
            $builder->latest('id');
        }

        return $builder;
    }
}

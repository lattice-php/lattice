<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Tables\Columns\BooleanColumn;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\IconColumn;
use Lattice\Lattice\Tables\Columns\ImageColumn;
use Lattice\Lattice\Tables\Columns\StackColumn;
use Lattice\Lattice\Ui\Components\Text;
use Workbench\App\Models\Product;

#[AsTable('workbench.demo.visual-columns')]
class VisualColumnsTable extends BaseProductsDemoTable
{
    /**
     * @return array<int, Column>
     */
    public function columns(): array
    {
        return [
            ImageColumn::make('image')->label(__('workbench.tables.columns.image'))->size(44),
            StackColumn::make('identity')
                ->label(__('workbench.tables.columns.identity'))
                ->schema([
                    Text::make('')->dataKey('text', 'name'),
                    Text::make('')->dataKey('text', 'sku'),
                ]),
            IconColumn::make('status')
                ->label(__('workbench.tables.columns.status'))
                ->icons([
                    'draft' => 'clock',
                    'active' => 'check',
                    'archived' => 'circle-x',
                ])
                ->colors([
                    'draft' => 'gray',
                    'active' => 'green',
                    'archived' => 'red',
                ]),
            BooleanColumn::make('featured')->label(__('workbench.tables.columns.featured'))->sortable(),
        ];
    }

    /**
     * @return Builder<Product>
     */
    protected function query(): Builder
    {
        return Product::query()
            ->with('images')
            ->select(['id', 'name', 'sku', 'status', 'featured']);
    }
}

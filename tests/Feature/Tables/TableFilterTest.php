<?php
declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Attributes\Table as TableAttribute;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Tables\EloquentTableDefinition;
use Lattice\Lattice\Tables\Filters\SelectFilter;
use Lattice\Lattice\Tables\TableQuery;
use Workbench\App\Models\Product;

test('a table serializes its declared filters and starts with no active values', function () {
    Lattice::tables([WorkbenchFilteredProductsTable::class]);

    $table = wire(Table::use(WorkbenchFilteredProductsTable::class));

    expect($table['props']['filters'])->toBe([
        [
            'key' => 'status',
            'label' => 'Status',
            'type' => 'select',
            'props' => [
                'options' => [
                    ['label' => 'Draft', 'value' => 'draft'],
                    ['label' => 'Active', 'value' => 'active'],
                ],
                'multiple' => false,
                'searchable' => false,
                'placeholder' => null,
            ],
        ],
    ])
        ->and($table['props']['state']['tableFilters'])->toBe([]);
});

test('a table applies a dedicated select filter from the request', function () {
    Lattice::tables([WorkbenchFilteredProductsTable::class]);

    Product::factory()->create(['name' => 'Active One', 'status' => 'active']);
    Product::factory()->create(['name' => 'Draft One', 'status' => 'draft']);

    $ref = componentRef(wire(Table::use(WorkbenchFilteredProductsTable::class)));

    $response = latticeGet('/lattice/tables/workbench.filtered-products?tf[status]=active', $ref)
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Active One')
        ->assertJsonPath('state.tableFilters.status', 'active');

    expect($response->json('data'))->toHaveCount(1);
});

test('a table rejects a filter key that is not declared', function () {
    Lattice::tables([WorkbenchFilteredProductsTable::class]);

    $ref = componentRef(wire(Table::use(WorkbenchFilteredProductsTable::class)));

    latticeGet('/lattice/tables/workbench.filtered-products?tf[unknown]=x', $ref)
        ->assertUnprocessable()
        ->assertJsonPath('message', 'Filter [unknown] is not allowed for table [workbench.filtered-products].');
});

/**
 * @extends EloquentTableDefinition<Product>
 */
#[TableAttribute('workbench.filtered-products')]
class WorkbenchFilteredProductsTable extends EloquentTableDefinition
{
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label('Name'),
        ];
    }

    public function filters(): array
    {
        return [
            SelectFilter::make('status')->label('Status')->options([
                SelectFilter::option('Draft', 'draft'),
                SelectFilter::option('Active', 'active'),
            ]),
        ];
    }

    /**
     * @return Builder<Product>
     */
    public function builder(TableQuery $query): Builder
    {
        return Product::query()->select(['id', 'name', 'status'])->orderBy('id');
    }
}

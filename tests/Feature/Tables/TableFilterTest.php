<?php
declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Core\Contracts\OptionSource;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Tables\EloquentTableDefinition;
use Lattice\Lattice\Tables\Filters\SelectFilter;
use Lattice\Lattice\Tables\TableQuery;
use Workbench\App\Models\Product;

function peopleOptionSource(): OptionSource
{
    return inMemoryOptionSource(['1' => 'Ada', '2' => 'Linus', '3' => 'Grace']);
}

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

test('a table searches a searchable filter\'s options through the endpoint', function () {
    Lattice::tables([WorkbenchSearchableFilterTable::class]);

    $ref = componentRef(wire(Table::use(WorkbenchSearchableFilterTable::class)));

    latticeGet('/lattice/tables/workbench.searchable-filter?_search=author&q=ad', $ref)
        ->assertOk()
        ->assertExactJson(['options' => [['label' => 'Ada', 'value' => '1']]]);
});

test('a table searches a searchable column filter through the endpoint', function () {
    Lattice::tables([WorkbenchSearchableFilterTable::class]);

    $ref = componentRef(wire(Table::use(WorkbenchSearchableFilterTable::class)));

    latticeGet('/lattice/tables/workbench.searchable-filter?_search=owner&q=ad', $ref)
        ->assertOk()
        ->assertExactJson(['options' => [['label' => 'Ada', 'value' => '1']]]);
});

test('a table 404s searching an unknown filter key', function () {
    Lattice::tables([WorkbenchSearchableFilterTable::class]);

    $ref = componentRef(wire(Table::use(WorkbenchSearchableFilterTable::class)));

    latticeGet('/lattice/tables/workbench.searchable-filter?_search=nope&q=a', $ref)
        ->assertNotFound();
});

test('a table rejects searching a filter that is not searchable', function () {
    Lattice::tables([WorkbenchFilteredProductsTable::class]);

    $ref = componentRef(wire(Table::use(WorkbenchFilteredProductsTable::class)));

    latticeGet('/lattice/tables/workbench.filtered-products?_search=status&q=a', $ref)
        ->assertStatus(422);
});

/**
 * @extends EloquentTableDefinition<Product>
 */
#[AsTable('workbench.searchable-filter')]
class WorkbenchSearchableFilterTable extends EloquentTableDefinition
{
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label('Name'),
            TextColumn::make('owner')->label('Owner')->filterOptions(peopleOptionSource(), searchable: true),
        ];
    }

    #[Override]
    public function filters(): array
    {
        return [
            SelectFilter::make('author')->optionsFrom(peopleOptionSource())->searchable(),
        ];
    }

    /**
     * @return Builder<Product>
     */
    public function builder(TableQuery $query): Builder
    {
        return Product::query()->select(['id', 'name']);
    }
}

/**
 * @extends EloquentTableDefinition<Product>
 */
#[AsTable('workbench.filtered-products')]
class WorkbenchFilteredProductsTable extends EloquentTableDefinition
{
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label('Name'),
        ];
    }

    #[Override]
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

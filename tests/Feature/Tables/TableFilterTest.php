<?php
declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Core\Contracts\OptionSource;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Tables\Columns\ColumnFilterOption;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Tables\Filters\Filter;
use Lattice\Lattice\Tables\Filters\SelectFilter;
use Lattice\Lattice\Tables\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Lattice\Tables\TableQuery;
use Workbench\App\Models\Product;

function peopleOptionSource(): OptionSource
{
    return inMemoryOptionSource(['1' => 'Ada', '2' => 'Linus', '3' => 'Grace']);
}

test('a table serializes its declared filters and starts with no active values', function (): void {
    Lattice::tables([WorkbenchFilteredProductsTable::class]);

    $table = wire(Table::use(WorkbenchFilteredProductsTable::class));

    expect($table['props']['filters'][0])->toMatchArray([
        'type' => 'filter.select',
        'key' => 'status',
        'props' => [
            'label' => 'Status',
            'multiple' => false,
            'searchable' => false,
            'options' => [
                ['label' => 'Draft', 'value' => 'draft'],
                ['label' => 'Active', 'value' => 'active'],
            ],
            'placeholder' => null,
        ],
    ])
        ->and($table['props']['filters'][0]['schema'])->toHaveCount(1)
        ->and($table['props']['state']['tableFilters'])->toBe([])
        ->and($table['props']['state']['tableFilterIndicators'])->toBe([]);
});

test('a table applies a dedicated select filter from the request', function (): void {
    Lattice::tables([WorkbenchFilteredProductsTable::class]);

    Product::factory()->create(['name' => 'Active One', 'status' => 'active']);
    Product::factory()->create(['name' => 'Draft One', 'status' => 'draft']);

    $response = $this->loadTable(WorkbenchFilteredProductsTable::class, ['tf' => ['status' => ['value' => 'active']]])
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Active One')
        ->assertJsonPath('state.tableFilters.status.value', 'active')
        ->assertJsonPath('state.tableFilterIndicators.0.value', 'Active');

    expect($response->json('data'))->toHaveCount(1);
});

test('a table rejects a filter key that is not declared', function (): void {
    Lattice::tables([WorkbenchFilteredProductsTable::class]);

    $this->loadTable(WorkbenchFilteredProductsTable::class, ['tf' => ['unknown' => ['value' => 'x']]])
        ->assertUnprocessable()
        ->assertJsonPath('message', 'Filter [unknown] is not allowed for table [workbench.filtered-products].');
});

test('a table searches a searchable filter\'s options through the endpoint', function (): void {
    Lattice::tables([WorkbenchSearchableFilterTable::class]);

    $this->loadTable(WorkbenchSearchableFilterTable::class, ['_search' => 'filter:author.value', 'q' => 'ad'])
        ->assertOk()
        ->assertExactJson(['options' => [['label' => 'Ada', 'value' => '1']]]);
});

test('a table searches a searchable column filter through the endpoint', function (): void {
    Lattice::tables([WorkbenchSearchableFilterTable::class]);

    $this->loadTable(WorkbenchSearchableFilterTable::class, ['_search' => 'column:owner', 'q' => 'ad'])
        ->assertOk()
        ->assertExactJson(['options' => [['label' => 'Ada', 'value' => '1']]]);
});

test('a table 404s searching an unknown filter key', function (): void {
    Lattice::tables([WorkbenchSearchableFilterTable::class]);

    $this->loadTable(WorkbenchSearchableFilterTable::class, ['_search' => 'filter:nope', 'q' => 'a'])
        ->assertNotFound();
});

test('a table 404s searching without a namespaced target', function (): void {
    Lattice::tables([WorkbenchSearchableFilterTable::class]);

    $this->loadTable(WorkbenchSearchableFilterTable::class, ['_search' => 'owner', 'q' => 'a'])
        ->assertNotFound();
});

test('a filter key does not shadow a column of the same name', function (): void {
    Lattice::tables([WorkbenchSearchableFilterTable::class]);

    $this->loadTable(WorkbenchSearchableFilterTable::class, ['_search' => 'column:author', 'q' => 'ad'])
        ->assertOk()
        ->assertExactJson(['options' => [['label' => 'Ada', 'value' => '1']]]);
});

test('a table rejects searching a filter that is not searchable', function (): void {
    Lattice::tables([WorkbenchFilteredProductsTable::class]);

    $this->loadTable(WorkbenchFilteredProductsTable::class, ['_search' => 'filter:status', 'q' => 'a'])
        ->assertUnprocessable();
});

test('a table omits a filter hidden via visible(false) from the serialized filters', function (): void {
    $table = Table::make('t')->filters([
        SelectFilter::make('status')->options([SelectFilter::option('Active', 'active')]),
        SelectFilter::make('secret')->options([SelectFilter::option('Active', 'active')])->visible(false),
    ]);

    $keys = array_map(fn (Filter $filter): string => $filter->key(), $table->filters);

    expect($keys)->toBe(['status']);
});

test('a table omits a filter hidden via a visibility closure from the serialized filters', function (): void {
    $table = Table::make('t')->filters([
        SelectFilter::make('status')->options([SelectFilter::option('Active', 'active')]),
        SelectFilter::make('secret')->options([SelectFilter::option('Active', 'active')])->visible(fn (): bool => false),
    ]);

    $keys = array_map(fn (Filter $filter): string => $filter->key(), $table->filters);

    expect($keys)->toBe(['status']);
});

test('a table serializes filters as an empty array, not null, when every declared filter is hidden', function (): void {
    $wire = wire(Table::make('t')->filters([
        SelectFilter::make('secret')->options([SelectFilter::option('Active', 'active')])->visible(false),
    ]));

    expect($wire['props']['filters'])->toBe([]);
});

test('a table accepts column filter clause option operators', function (): void {
    Lattice::tables([WorkbenchClauseOptionProductsTable::class]);

    Product::factory()->create(['name' => 'June One', 'updated_at' => '2026-06-12 12:00:00']);
    Product::factory()->create(['name' => 'July One', 'updated_at' => '2026-07-01 12:00:00']);

    $response = $this->loadTable(WorkbenchClauseOptionProductsTable::class, [
        'filter' => 'updated_at:gte:2026-06-01,updated_at:lte:2026-06-30',
    ])
        ->assertOk()
        ->assertJsonPath('data.0.name', 'June One');

    expect($response->json('data'))->toHaveCount(1);
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
            TextColumn::make('author')->label('Author')->filterOptions(peopleOptionSource(), searchable: true),
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

/**
 * @extends EloquentTableDefinition<Product>
 */
#[AsTable('workbench.clause-option-products')]
class WorkbenchClauseOptionProductsTable extends EloquentTableDefinition
{
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label('Name'),
            TextColumn::make('updated_at')->label('Updated')->date()->filterOptions([
                ColumnFilterOption::range('June 2026', 'june-2026', '2026-06-01', '2026-06-30'),
            ]),
            TextColumn::make('status')->label('Status')->filterOptions([
                ColumnFilterOption::clause('Unset', 'unset', Op::Empty),
            ]),
        ];
    }

    /**
     * @return Builder<Product>
     */
    public function builder(TableQuery $query): Builder
    {
        return Product::query()->select(['id', 'name', 'updated_at', 'status'])->orderBy('id');
    }
}

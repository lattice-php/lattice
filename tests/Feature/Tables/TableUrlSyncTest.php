<?php
declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Lattice\Core\Facades\Lattice;
use Lattice\Table\Attributes\AsTable;
use Lattice\Table\CallbackTableSource;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Components\Table;
use Lattice\Table\Contracts\TableSource;
use Lattice\Table\Filters\SelectFilter;
use Lattice\Table\InvalidTableQuery;
use Lattice\Table\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Table\TableDefinition;
use Lattice\Table\TableQuery;
use Lattice\Table\TableRegistry;
use Lattice\Table\TableResult;
use Workbench\App\Models\Product;

test('a synced table restores q, sort, page and tf from the request and filters/sorts/pages the result', function (): void {
    Lattice::tables([UrlSyncProductsTable::class]);

    Product::factory()->create(['name' => 'Alpha Gadget', 'status' => 'active']);
    Product::factory()->create(['name' => 'Beta Gadget', 'status' => 'active']);
    Product::factory()->create(['name' => 'Gamma Gadget', 'status' => 'active']);
    Product::factory()->create(['name' => 'Delta Gadget', 'status' => 'draft']);

    app()->instance('request', Request::create('/', 'GET', [
        'q' => 'Gadget',
        'sort' => '-name',
        'page' => 2,
        'tf' => ['status' => ['value' => 'active']],
    ]));

    $table = wire(Table::use(UrlSyncProductsTable::class));

    expect(data_get($table, 'props.query.search'))->toBe('Gadget')
        ->and(data_get($table, 'props.query.sorts.0.key'))->toBe('name')
        ->and(data_get($table, 'props.query.sorts.0.direction'))->toBe('desc')
        ->and(data_get($table, 'props.query.page'))->toBe(2)
        ->and(data_get($table, 'props.query.tableFilters.status.value'))->toBe('active')
        ->and(data_get($table, 'props.syncQuery'))->toBeTrue()
        ->and(data_get($table, 'props.queryKey'))->toBeNull()
        ->and(data_get($table, 'props.defaultPerPage'))->toBe(2)
        ->and(array_column(data_get($table, 'props.data'), 'name'))->toBe(['Alpha Gadget']);
});

test('a synced table drops an invalid filter field, unknown sort key, unknown tf key and bad operator instead of throwing', function (): void {
    Lattice::tables([UrlSyncProductsTable::class]);

    Product::factory()->create(['name' => 'Alpha Gadget', 'status' => 'active']);

    app()->instance('request', Request::create('/', 'GET', [
        'filter' => 'unknown_field:bogus:x',
        'sort' => 'unknown_field',
        'tf' => ['unknown_filter' => ['value' => 'x']],
    ]));

    $table = wire(Table::use(UrlSyncProductsTable::class));

    expect(data_get($table, 'props.query.filters'))->toBe([])
        ->and(data_get($table, 'props.query.sorts'))->toBe([])
        ->and(data_get($table, 'props.query.tableFilters'))->toBe([])
        ->and(array_column(data_get($table, 'props.data'), 'name'))->toBe(['Alpha Gadget']);
});

test('a non-synced table ignores request query params and renders an empty query', function (): void {
    Lattice::tables([UrlSyncOffProductsTable::class]);

    app()->instance('request', Request::create('/', 'GET', [
        'q' => 'Gadget',
        'sort' => '-name',
        'page' => 2,
    ]));

    $table = wire(Table::use(UrlSyncOffProductsTable::class));

    expect(data_get($table, 'props.query.search'))->toBe('')
        ->and(data_get($table, 'props.query.sorts'))->toBe([])
        ->and(data_get($table, 'props.query.page'))->toBe(1)
        ->and(data_get($table, 'props.syncQuery'))->toBeFalse();
});

test('two prefixed synced tables on the same page each seed only their own namespace', function (): void {
    Lattice::tables([UrlSyncTableA::class, UrlSyncTableB::class]);

    app()->instance('request', Request::create('/', 'GET', [
        'a' => ['q' => 'x'],
        'b' => ['q' => 'y'],
        'q' => 'unprefixed',
    ]));

    $tableA = wire(Table::use(UrlSyncTableA::class));
    $tableB = wire(Table::use(UrlSyncTableB::class));

    expect(data_get($tableA, 'props.query.search'))->toBe('x')
        ->and(data_get($tableA, 'props.queryKey'))->toBe('a')
        ->and(data_get($tableB, 'props.query.search'))->toBe('y')
        ->and(data_get($tableB, 'props.queryKey'))->toBe('b');
});

test('a lazy synced table still seeds its query from the request', function (): void {
    Lattice::tables([UrlSyncProductsTable::class]);

    app()->instance('request', Request::create('/', 'GET', ['q' => 'Gadget']));

    $table = wire(Table::lazy(UrlSyncProductsTable::class));

    expect(data_get($table, 'props.query.search'))->toBe('Gadget')
        ->and(data_get($table, 'props.lazy'))->toBeTrue();
});

test('the table endpoint still rejects an unknown filter, unaffected by tolerant page-render parsing', function (): void {
    Lattice::tables([UrlSyncProductsTable::class]);

    app(TableRegistry::class)->response(
        'workbench.url-sync-products',
        Request::create('/', 'GET', ['tf' => ['unknown_filter' => ['value' => 'x']]]),
    );
})->throws(InvalidTableQuery::class);

/**
 * @extends EloquentTableDefinition<Product>
 */
#[AsTable('workbench.url-sync-products')]
final class UrlSyncProductsTable extends EloquentTableDefinition
{
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label('Name')->sortable()->searchable(),
        ];
    }

    public function filters(): array
    {
        return [
            SelectFilter::make('status')->label('Status')->options([
                'draft' => 'Draft',
                'active' => 'Active',
                'archived' => 'Archived',
            ]),
        ];
    }

    public function perPage(): int
    {
        return 2;
    }

    #[Override]
    public function syncsQueryToUrl(): bool
    {
        return true;
    }

    /**
     * @return Builder<Product>
     */
    public function builder(TableQuery $query): Builder
    {
        return Product::query();
    }
}

/**
 * @extends EloquentTableDefinition<Product>
 */
#[AsTable('workbench.url-sync-off-products')]
final class UrlSyncOffProductsTable extends EloquentTableDefinition
{
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label('Name')->sortable(),
        ];
    }

    /**
     * @return Builder<Product>
     */
    public function builder(TableQuery $query): Builder
    {
        return Product::query();
    }
}

#[AsTable('workbench.url-sync-a')]
final class UrlSyncTableA extends TableDefinition
{
    public function columns(): array
    {
        return [TextColumn::make('name')->label('Name')];
    }

    #[Override]
    public function syncsQueryToUrl(): bool
    {
        return true;
    }

    #[Override]
    public function urlQueryKey(): string
    {
        return 'a';
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([]));
    }
}

#[AsTable('workbench.url-sync-b')]
final class UrlSyncTableB extends TableDefinition
{
    public function columns(): array
    {
        return [TextColumn::make('name')->label('Name')];
    }

    #[Override]
    public function syncsQueryToUrl(): bool
    {
        return true;
    }

    #[Override]
    public function urlQueryKey(): string
    {
        return 'b';
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([]));
    }
}

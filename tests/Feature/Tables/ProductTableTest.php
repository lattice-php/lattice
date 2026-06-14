<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Tables\InvalidTableQuery;
use Lattice\Lattice\Tables\TableQuery;
use Workbench\App\Actions\ArchiveSelectedProductsAction;
use Workbench\App\Actions\RejectSelectedProductsAction;
use Workbench\App\Models\Product;
use Workbench\App\Seeders\ProductSeeder;
use Workbench\App\Tables\ProductsTable;

use function Pest\Laravel\patch;

test('the product seeder creates sample product data idempotently', function () {
    app(ProductSeeder::class)->run();
    app(ProductSeeder::class)->run();

    expect(Product::query()->count())->toBe(100)
        ->and(Product::query()->where('sku', 'workbench-product-001')->exists())->toBeTrue()
        ->and(Product::query()->where('sku', 'workbench-product-100')->exists())->toBeTrue()
        ->and(Product::query()->whereNotIn('status', ['draft', 'active', 'archived'])->exists())->toBeFalse();
});

test('the products table is serialized as striped', function () {
    Lattice::tables([ProductsTable::class]);

    expect(data_get(wire(Table::use(ProductsTable::class)), 'props.striped'))->toBeTrue();
});

test('the products table serializes bulk actions bound to the table', function () {
    Lattice::tables([ProductsTable::class]);
    Lattice::bulkActions([ArchiveSelectedProductsAction::class, RejectSelectedProductsAction::class]);

    $bulkActions = data_get(wire(Table::use(ProductsTable::class)), 'props.bulkActions');

    expect($bulkActions)->toBeArray()->toHaveCount(2)
        ->and($bulkActions[0]['id'])->toBe('workbench.products.archive-selected')
        ->and($bulkActions[0]['props']['endpoint'])
        ->toBe('/lattice/bulk-actions/workbench.products.archive-selected')
        ->and($bulkActions[0]['props']['ref'])->toBeString()
        ->and($bulkActions[1]['id'])->toBe('workbench.products.reject-selected')
        ->and($bulkActions[1]['props']['form']['schema'][0]['props']['name'])->toBe('reason');
});

test('bulk actions can target every row matching the current filter', function () {
    Lattice::tables([ProductsTable::class]);
    Lattice::bulkActions([ArchiveSelectedProductsAction::class]);

    Product::factory()->count(3)->create(['status' => 'active']);
    $draft = Product::factory()->create(['status' => 'draft']);

    $ref = app(ComponentReferenceSigner::class)->seal(
        'bulkAction',
        'workbench.products.archive-selected',
        ['table' => 'workbench.products'],
    );

    patch('/lattice/bulk-actions/workbench.products.archive-selected', [
        'allMatching' => true,
        'filter' => 'status:eq:active',
    ], ['X-Lattice-Ref' => $ref])
        ->assertOk()
        ->assertJsonPath('data.archived', 3);

    expect(Product::query()->where('status', 'archived')->count())->toBe(3)
        ->and($draft->fresh()->status)->toBe('draft');
});

test('bulk all-matching validates the filter against the table columns', function () {
    Lattice::tables([ProductsTable::class]);
    Lattice::bulkActions([ArchiveSelectedProductsAction::class]);

    $ref = app(ComponentReferenceSigner::class)->seal(
        'bulkAction',
        'workbench.products.archive-selected',
        ['table' => 'workbench.products'],
    );

    patch('/lattice/bulk-actions/workbench.products.archive-selected', [
        'allMatching' => true,
        'filter' => 'id:eq:1',
    ], ['X-Lattice-Ref' => $ref])
        ->assertUnprocessable()
        ->assertJsonPath('errors.filter.0', 'Filter [id] is not allowed for table [workbench.products].');
});

test('the products table applies date and boolean clause filters', function () {
    $featured = Product::factory()->create(['featured' => true, 'updated_at' => '2026-06-01 10:00:00']);
    Product::factory()->create(['featured' => false, 'updated_at' => '2026-06-02 10:00:00']);

    $table = new ProductsTable;
    $columns = $table->columns();

    $resolve = fn (string $filter) => $table->source()->resolveMatching(
        TableQuery::fromRequest(Request::create('/', 'GET', ['filter' => $filter]), $columns, 'workbench.products'),
    );

    expect($resolve('featured:eq:true')->pluck('id')->all())->toBe([$featured->getKey()])
        ->and($resolve('updated_at:before:2026-06-02')->pluck('id')->all())->toBe([$featured->getKey()]);
});

test('the products table high value filter matches by default sales price', function () {
    $expensive = Product::factory()->withoutDefaultPrice()->create();
    $expensive->salesPrices()->create(['group_id' => null, 'amount' => '1500.00']);
    Product::factory()->withoutDefaultPrice()->create()
        ->salesPrices()->create(['group_id' => null, 'amount' => '50.00']);

    $table = new ProductsTable;
    $highValue = collect($table->filters())->firstOrFail(fn ($filter) => $filter->key === 'high_value');

    $builder = $table->builder(TableQuery::fromRequest(Request::create('/'), $table->columns(), 'workbench.products'));
    $highValue->apply($builder, true);

    expect($builder->pluck('products.id')->all())->toBe([$expensive->getKey()]);
});

test('the products table applies text, starts/ends-with, and presence filters', function () {
    $widget = Product::factory()->create(['name' => 'Widget']);
    $gizmo = Product::factory()->create(['name' => 'Gizmo']);
    $blank = Product::factory()->create(['name' => '']);

    $table = new ProductsTable;
    $columns = $table->columns();

    $resolve = fn (string $filter) => $table->source()->resolveMatching(
        TableQuery::fromRequest(Request::create('/', 'GET', ['filter' => $filter]), $columns, 'workbench.products'),
    );

    expect($resolve('name:starts_with:Wid')->pluck('id')->all())->toBe([$widget->getKey()])
        ->and($resolve('name:ends_with:zmo')->pluck('id')->all())->toBe([$gizmo->getKey()])
        ->and($resolve('name:empty:')->pluck('id')->all())->toBe([$blank->getKey()])
        ->and($resolve('name:filled:')->pluck('id')->sort()->values()->all())->toBe([$widget->getKey(), $gizmo->getKey()]);
});

test('the products table rejects a filter operator not allowed for the column', function () {
    $columns = (new ProductsTable)->columns();

    expect(fn () => TableQuery::fromRequest(
        Request::create('/', 'GET', ['filter' => 'featured:contains:x']),
        $columns,
        'workbench.products',
    ))->toThrow(
        InvalidTableQuery::class,
        'Operator [contains] is not allowed for filter [featured] on table [workbench.products].',
    );
});

test('the products table rejects invalid boolean and date filter values', function (string $filter, string $message) {
    $columns = (new ProductsTable)->columns();

    expect(fn () => TableQuery::fromRequest(
        Request::create('/', 'GET', ['filter' => $filter]),
        $columns,
        'workbench.products',
    ))->toThrow(InvalidTableQuery::class, $message);
})->with([
    'boolean' => [
        'featured:eq:maybe',
        'Value [maybe] is not valid for filter [featured] on table [workbench.products].',
    ],
    'date equals' => [
        'updated_at:eq:not-a-date',
        'Value [not-a-date] is not valid for filter [updated_at] on table [workbench.products].',
    ],
    'date before' => [
        'updated_at:before:2026-99-99',
        'Value [2026-99-99] is not valid for filter [updated_at] on table [workbench.products].',
    ],
]);

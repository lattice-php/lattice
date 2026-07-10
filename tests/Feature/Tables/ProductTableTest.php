<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Lattice\Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Tables\InvalidTableQuery;
use Lattice\Lattice\Tables\TableQuery;
use Workbench\App\Actions\ArchiveSelectedProductsAction;
use Workbench\App\Actions\RejectSelectedProductsAction;
use Workbench\App\Models\File;
use Workbench\App\Models\Product;
use Workbench\App\Tables\ProductsTable;

use function Pest\Laravel\patch;

test('the products table exposes product images', function (): void {
    Storage::fake('s3');
    Lattice::tables([ProductsTable::class]);

    Storage::disk('s3')->put('workbench/products/PHONE-001.webp', 'primary');
    Storage::disk('s3')->put('workbench/products/PHONE-002.webp', 'secondary');

    $primary = File::factory()->create([
        'disk' => 's3',
        'path' => 'workbench/products/PHONE-001.webp',
        'name' => 'PHONE-001.webp',
        'mime_type' => 'image/webp',
        'size' => 7,
    ]);
    $secondary = File::factory()->create([
        'disk' => 's3',
        'path' => 'workbench/products/PHONE-002.webp',
        'name' => 'PHONE-002.webp',
        'mime_type' => 'image/webp',
        'size' => 9,
    ]);

    $product = Product::factory()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
    ]);
    $product->images()->attach([
        $secondary->getKey() => ['sort_order' => 2],
        $primary->getKey() => ['sort_order' => 1],
    ]);

    $table = wire(Table::use(ProductsTable::class));

    expect(data_get($table, 'props.columns.0.type'))->toBe('column.image')
        ->and(data_get($table, 'props.columns.0.key'))->toBe('image')
        ->and(data_get($table, 'props.data.0.image'))->toContain('workbench/products/PHONE-001.webp')
        ->and(DB::table('attachments')
            ->where('attachable_type', Product::class)
            ->where('attachable_id', $product->getKey())
            ->count())->toBe(2)
        ->and($product->images()->count())->toBe(2);
});

test('the products table is serialized as striped', function (): void {
    Lattice::tables([ProductsTable::class]);

    expect(data_get(wire(Table::use(ProductsTable::class)), 'props.striped'))->toBeTrue();
});

test('the products table serializes bulk actions bound to the table', function (): void {
    Lattice::tables([ProductsTable::class]);
    Lattice::bulkActions([ArchiveSelectedProductsAction::class, RejectSelectedProductsAction::class]);

    $table = wire(Table::use(ProductsTable::class));

    expect(data_get($table, 'props.bulkActions.0.props.ref'))->toBeString();

    $this->assertLatticeComponent($table)
        ->assertRenderedCount('action.bulk', 2)
        ->component('action.bulk', 'workbench.products.archive-selected', fn ($action) => $action
            ->assertProp('endpoint', '/lattice/bulk-actions/workbench.products.archive-selected'))
        ->component('action.bulk', 'workbench.products.reject-selected', fn ($action) => $action
            ->assertProp('form.schema.0.props.name', 'reason'));
});

test('bulk actions can target every row matching the current filter', function (): void {
    Lattice::tables([ProductsTable::class]);
    Lattice::bulkActions([ArchiveSelectedProductsAction::class]);

    Product::factory()->count(3)->create(['status' => 'active']);
    $draft = Product::factory()->create(['status' => 'draft']);

    $ref = app(ComponentReferenceSigner::class)->seal(
        'action.bulk',
        'workbench.products.archive-selected',
        ['table' => 'workbench.products'],
    );

    patch('/lattice/bulk-actions/workbench.products.archive-selected', [
        'allMatching' => true,
        'filter' => 'status:eq:active',
    ], $this->latticeHeaders($ref))
        ->assertOk()
        ->assertJsonPath('data.archived', 3);

    expect(Product::query()->where('status', 'archived')->count())->toBe(3)
        ->and($draft->fresh()->status)->toBe('draft');
});

test('bulk all-matching validates the filter against the table columns', function (): void {
    Lattice::tables([ProductsTable::class]);
    Lattice::bulkActions([ArchiveSelectedProductsAction::class]);

    $ref = app(ComponentReferenceSigner::class)->seal(
        'action.bulk',
        'workbench.products.archive-selected',
        ['table' => 'workbench.products'],
    );

    patch('/lattice/bulk-actions/workbench.products.archive-selected', [
        'allMatching' => true,
        'filter' => 'id:eq:1',
    ], $this->latticeHeaders($ref))
        ->assertUnprocessable()
        ->assertJsonPath('errors.filter.0', 'Filter [id] is not allowed for table [workbench.products].');
});

test('the products table applies date and boolean clause filters', function (): void {
    $featured = Product::factory()->create(['featured' => true, 'updated_at' => '2026-06-01 10:00:00']);
    Product::factory()->create(['featured' => false, 'updated_at' => '2026-06-02 10:00:00']);

    $table = new ProductsTable;
    $columns = $table->columns();

    $resolve = fn (string $filter): Collection => $table->source()->resolveMatching(
        TableQuery::fromRequest(Request::create('/', 'GET', ['filter' => $filter]), $columns, 'workbench.products'),
    );

    expect($resolve('featured:eq:true')->pluck('id')->all())->toBe([$featured->getKey()])
        ->and($resolve('updated_at:before:2026-06-02')->pluck('id')->all())->toBe([$featured->getKey()]);
});

test('the products table high value filter matches by default sales price', function (): void {
    $expensive = Product::factory()->withoutDefaultPrice()->create();
    $expensive->salesPrices()->create(['group_id' => null, 'amount' => '1500.00']);
    Product::factory()->withoutDefaultPrice()->create()
        ->salesPrices()->create(['group_id' => null, 'amount' => '50.00']);

    $table = new ProductsTable;
    $highValue = collect($table->filters())->firstOrFail(fn ($filter): bool => $filter->key() === 'high_value');

    $builder = $table->builder(TableQuery::fromRequest(Request::create('/'), $table->columns(), 'workbench.products'));
    $highValue->apply($builder, FormData::make(['value' => true]));

    expect($builder->pluck('products.id')->all())->toBe([$expensive->getKey()]);
});

test('the products table applies text, starts/ends-with, and presence filters', function (): void {
    $widget = Product::factory()->create(['name' => 'Widget']);
    $gizmo = Product::factory()->create(['name' => 'Gizmo']);
    $blank = Product::factory()->create(['name' => '']);

    $table = new ProductsTable;
    $columns = $table->columns();

    $resolve = fn (string $filter): Collection => $table->source()->resolveMatching(
        TableQuery::fromRequest(Request::create('/', 'GET', ['filter' => $filter]), $columns, 'workbench.products'),
    );

    expect($resolve('name:starts_with:Wid')->pluck('id')->all())->toBe([$widget->getKey()])
        ->and($resolve('name:ends_with:zmo')->pluck('id')->all())->toBe([$gizmo->getKey()])
        ->and($resolve('name:empty:')->pluck('id')->all())->toBe([$blank->getKey()])
        ->and($resolve('name:filled:')->pluck('id')->sort()->values()->all())->toBe([$widget->getKey(), $gizmo->getKey()]);
});

test('the products table rejects a filter operator not allowed for the column', function (): void {
    $columns = (new ProductsTable)->columns();

    expect(fn (): TableQuery => TableQuery::fromRequest(
        Request::create('/', 'GET', ['filter' => 'featured:contains:x']),
        $columns,
        'workbench.products',
    ))->toThrow(
        InvalidTableQuery::class,
        'Operator [contains] is not allowed for filter [featured] on table [workbench.products].',
    );
});

test('the products table rejects invalid boolean and date filter values', function (string $filter, string $message): void {
    $columns = (new ProductsTable)->columns();

    expect(fn (): TableQuery => TableQuery::fromRequest(
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

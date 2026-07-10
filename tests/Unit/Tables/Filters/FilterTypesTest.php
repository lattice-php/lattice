<?php
declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Tables\Filters\DateRangeFilter;
use Lattice\Lattice\Tables\Filters\SelectFilter;
use Lattice\Lattice\Tables\Filters\TernaryFilter;
use Lattice\Lattice\Tables\Filters\ToggleFilter;
use Lattice\Lattice\Tables\TableQuery;
use Workbench\App\Models\Product;

test('ternary filter serializes its wire shape', function (): void {
    $filter = wire(TernaryFilter::make('featured')
        ->trueLabel('Featured')
        ->falseLabel('Not featured'));

    expect($filter)->toMatchArray([
        'type' => 'filter.ternary',
        'key' => 'featured',
        'props' => [
            'label' => 'Featured',
            'trueLabel' => 'Featured',
            'falseLabel' => 'Not featured',
            'placeholder' => 'All',
        ],
    ])
        ->and($filter['schema'])->toHaveCount(1)
        ->and($filter['schema'][0]['type'])->toBe('field.select')
        ->and($filter['schema'][0]['props']['name'])->toBe('value')
        ->and($filter['schema'][0]['props']['options'])->toBe([
            ['label' => 'Featured', 'value' => 'true'],
            ['label' => 'Not featured', 'value' => 'false'],
        ]);
});

test('ternary filter serializes its default labels', function (): void {
    $filter = wire(TernaryFilter::make('verified'));

    expect($filter)->toMatchArray([
        'type' => 'filter.ternary',
        'key' => 'verified',
        'props' => [
            'label' => 'Verified',
            'trueLabel' => 'Yes',
            'falseLabel' => 'No',
            'placeholder' => 'All',
        ],
    ])
        ->and($filter['schema'])->toHaveCount(1)
        ->and($filter['schema'][0]['type'])->toBe('field.select')
        ->and($filter['schema'][0]['props']['name'])->toBe('value')
        ->and($filter['schema'][0]['props']['options'])->toBe([
            ['label' => 'Yes', 'value' => 'true'],
            ['label' => 'No', 'value' => 'false'],
        ]);
});

test('a ternary filter applies a boolean constraint', function (): void {
    $builder = Product::query();
    TernaryFilter::make('featured')->apply($builder, FormData::make(['value' => 'true']));
    expect($builder->toSql())->toContain('"featured" = ?')
        ->and($builder->getBindings())->toBe([true]);

    $other = Product::query();
    TernaryFilter::make('featured')->apply($other, FormData::make(['value' => 'false']));
    expect($other->getBindings())->toBe([false]);
});

test('a ternary filter runs custom queries when provided', function (): void {
    $builder = Product::query();

    TernaryFilter::make('verified')
        ->queries(
            true: fn (Builder $query) => $query->whereNotNull('verified_at'),
            false: fn (Builder $query) => $query->whereNull('verified_at'),
        )
        ->apply($builder, FormData::make(['value' => 'true']));

    expect($builder->toSql())->toContain('"verified_at" is not null');
});

test('date range filter serializes its wire shape', function (): void {
    $filter = wire(DateRangeFilter::make('created_at')->label('Created'));

    expect($filter)->toMatchArray([
        'type' => 'filter.date-range',
        'key' => 'created_at',
        'props' => ['label' => 'Created'],
    ])
        ->and($filter['schema'])->toHaveCount(2)
        ->and($filter['schema'][0]['type'])->toBe('field.date-input')
        ->and($filter['schema'][0]['props']['name'])->toBe('from')
        ->and($filter['schema'][1]['props']['name'])->toBe('until');
});

test('a date range filter applies from and until bounds', function (): void {
    $builder = Product::query();

    DateRangeFilter::make('created_at')->apply($builder, FormData::make(['from' => '2026-01-01', 'until' => '2026-06-30']));

    expect($builder->toSql())->toContain('"created_at')->and($builder->toSql())->toContain('>=')
        ->and($builder->toSql())->toContain('<=')
        ->and($builder->getBindings())->toBe(['2026-01-01', '2026-06-30']);
});

test('a date range filter applies only the provided bound', function (): void {
    $builder = Product::query();

    DateRangeFilter::make('created_at')->apply($builder, FormData::make(['from' => '2026-01-01']));

    expect($builder->getBindings())->toBe(['2026-01-01'])
        ->and($builder->toSql())->not->toContain('<=');
});

test('a toggle filter serializes as a toggle', function (): void {
    expect(wire(ToggleFilter::make('high_value')->label('High value')))
        ->toBe([
            'type' => 'filter.toggle',
            'key' => 'high_value',
            'props' => ['label' => 'High value'],
        ]);
});

test('a toggle filter runs its query closure when toggled on', function (): void {
    $builder = Product::query();

    ToggleFilter::make('high_value')
        ->query(fn (Builder $query) => $query->where('price', '>', 1000))
        ->apply($builder, FormData::make(['value' => '1']));

    expect($builder->toSql())->toContain('"price" > ?')
        ->and($builder->getBindings())->toBe([1000]);
});

test('a toggle filter is a no-op when toggled off', function (): void {
    $builder = Product::query();

    ToggleFilter::make('high_value')
        ->query(fn (Builder $query) => $query->where('price', '>', 1000))
        ->apply($builder, FormData::make(['value' => '0']));

    expect($builder->toSql())->not->toContain('where');
});

test('a toggle filter without a query applies a boolean constraint on its column', function (): void {
    $builder = Product::query();

    ToggleFilter::make('featured')->apply($builder, FormData::make(['value' => '1']));

    expect($builder->toSql())->toContain('"featured" = ?')
        ->and($builder->getBindings())->toBe([true]);
});

test('a ternary filter runs the false query branch', function (): void {
    $builder = Product::query();

    TernaryFilter::make('verified')
        ->queries(
            true: fn (Builder $query) => $query->whereNotNull('verified_at'),
            false: fn (Builder $query) => $query->whereNull('verified_at'),
        )
        ->apply($builder, FormData::make(['value' => 'false']));

    expect($builder->toSql())->toContain('"verified_at" is null');
});

test('a ternary filter ignores an unparseable value', function (): void {
    $builder = Product::query();

    TernaryFilter::make('featured')->apply($builder, FormData::make(['value' => 'garbage']));

    expect($builder->toSql())->not->toContain('where');
});

test('a date range filter ignores missing bounds', function (): void {
    $builder = Product::query();

    DateRangeFilter::make('created_at')->apply($builder, FormData::make([]));

    expect($builder->toSql())->not->toContain('where');
});

test('a filter constrains the column named by attribute()', function (): void {
    $builder = Product::query();

    SelectFilter::make('state')->attribute('status')->apply($builder, FormData::make(['value' => 'active']));

    expect($builder->toSql())->toContain('"status" = ?')
        ->and($builder->getBindings())->toBe(['active']);
});

test('table query drops a table-filter value the filter schema rejects', function (): void {
    $request = Request::create('/', 'GET', ['tf' => ['featured' => ['value' => 'garbage']]]);

    $query = TableQuery::fromRequest($request, [], 'demo', 25, [TernaryFilter::make('featured')]);

    expect($query->tableFilters)->toBe([]);
});

test('table query drops invalid select values while keeping valid selections', function (): void {
    $request = Request::create('/', 'GET', [
        'tf' => ['status' => ['value' => ['active', 'garbage', 'draft']]],
    ]);
    $filter = SelectFilter::make('status')
        ->multiple()
        ->options([
            SelectFilter::option('Active', 'active'),
            SelectFilter::option('Draft', 'draft'),
        ]);

    $query = TableQuery::fromRequest($request, [], 'demo', 25, [$filter]);

    expect($query->tableFilters)->toBe(['status' => ['value' => ['active', 'draft']]]);
});

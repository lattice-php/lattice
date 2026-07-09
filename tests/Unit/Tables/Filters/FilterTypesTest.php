<?php
declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Lattice\Lattice\Tables\Filters\DateRangeFilter;
use Lattice\Lattice\Tables\Filters\Filter;
use Lattice\Lattice\Tables\Filters\SelectFilter;
use Lattice\Lattice\Tables\Filters\TernaryFilter;
use Lattice\Lattice\Tables\TableQuery;
use Workbench\App\Models\Product;

test('ternary filter serializes its wire shape', function (): void {
    expect(wire(TernaryFilter::make('featured')
        ->trueLabel('Featured')
        ->falseLabel('Not featured')))
        ->toBe([
            'key' => 'featured',
            'label' => 'Featured',
            'type' => 'ternary',
            'props' => [
                'trueLabel' => 'Featured',
                'falseLabel' => 'Not featured',
                'placeholder' => 'All',
            ],
        ]);
});

test('a ternary filter applies a boolean constraint', function (): void {
    $builder = Product::query();
    TernaryFilter::make('featured')->apply($builder, 'true');
    expect($builder->toSql())->toContain('"featured" = ?')
        ->and($builder->getBindings())->toBe([true]);

    $other = Product::query();
    TernaryFilter::make('featured')->apply($other, 'false');
    expect($other->getBindings())->toBe([false]);
});

test('a ternary filter runs custom queries when provided', function (): void {
    $builder = Product::query();

    TernaryFilter::make('verified')
        ->queries(
            true: fn (Builder $query) => $query->whereNotNull('verified_at'),
            false: fn (Builder $query) => $query->whereNull('verified_at'),
        )
        ->apply($builder, 'true');

    expect($builder->toSql())->toContain('"verified_at" is not null');
});

test('a ternary filter rejects non-boolean values', function (): void {
    $filter = TernaryFilter::make('featured');
    expect($filter->accepts('true'))->toBeTrue()
        ->and($filter->accepts('false'))->toBeTrue()
        ->and($filter->accepts('garbage'))->toBeFalse();
});

test('date range filter serializes its wire shape', function (): void {
    expect(wire(DateRangeFilter::make('created_at')->label('Created')))
        ->toBe([
            'key' => 'created_at',
            'label' => 'Created',
            'type' => 'date-range',
            'props' => [],
        ]);
});

test('a date range filter applies from and until bounds', function (): void {
    $builder = Product::query();

    DateRangeFilter::make('created_at')->apply($builder, ['from' => '2026-01-01', 'until' => '2026-06-30']);

    expect($builder->toSql())->toContain('"created_at')->and($builder->toSql())->toContain('>=')
        ->and($builder->toSql())->toContain('<=')
        ->and($builder->getBindings())->toBe(['2026-01-01', '2026-06-30']);
});

test('a date range filter applies only the provided bound', function (): void {
    $builder = Product::query();

    DateRangeFilter::make('created_at')->apply($builder, ['from' => '2026-01-01']);

    expect($builder->getBindings())->toBe(['2026-01-01'])
        ->and($builder->toSql())->not->toContain('<=');
});

test('a generic filter serializes as a toggle', function (): void {
    expect(wire(Filter::make('high_value')->label('High value')))
        ->toBe([
            'key' => 'high_value',
            'label' => 'High value',
            'type' => 'toggle',
            'props' => [],
        ]);
});

test('a generic filter runs its query closure when toggled on', function (): void {
    $builder = Product::query();

    Filter::make('high_value')
        ->query(fn (Builder $query) => $query->where('price', '>', 1000))
        ->apply($builder, '1');

    expect($builder->toSql())->toContain('"price" > ?')
        ->and($builder->getBindings())->toBe([1000]);
});

test('a generic filter is a no-op when toggled off', function (): void {
    $builder = Product::query();

    Filter::make('high_value')
        ->query(fn (Builder $query) => $query->where('price', '>', 1000))
        ->apply($builder, '0');

    expect($builder->toSql())->not->toContain('where');
});

test('a generic filter without a query applies a boolean constraint on its column', function (): void {
    $builder = Product::query();

    Filter::make('featured')->apply($builder, '1');

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
        ->apply($builder, 'false');

    expect($builder->toSql())->toContain('"verified_at" is null');
});

test('a ternary filter ignores an unparseable value', function (): void {
    $builder = Product::query();

    TernaryFilter::make('featured')->apply($builder, 'garbage');

    expect($builder->toSql())->not->toContain('where');
});

test('a date range filter ignores a non-array value', function (): void {
    $filter = DateRangeFilter::make('created_at');
    $builder = Product::query();

    $filter->apply($builder, 'not-an-array');

    expect($filter->accepts('not-an-array'))->toBeFalse()
        ->and($builder->toSql())->not->toContain('where');
});

it('serialises a toggle filter', function (): void {
    expect(Filter::make('active')->toData()->jsonSerialize())->toEqual([
        'key' => 'active',
        'label' => 'Active',
        'type' => 'toggle',
        'props' => new stdClass,
    ]);
});

it('serialises a date-range filter', function (): void {
    expect(DateRangeFilter::make('created')->toData()->jsonSerialize())->toEqual([
        'key' => 'created',
        'label' => 'Created',
        'type' => 'date-range',
        'props' => new stdClass,
    ]);
});

it('serialises a ternary filter', function (): void {
    expect(TernaryFilter::make('verified')->toData()->jsonSerialize())->toBe([
        'key' => 'verified',
        'label' => 'Verified',
        'type' => 'ternary',
        'props' => [
            'trueLabel' => 'Yes',
            'falseLabel' => 'No',
            'placeholder' => 'All',
        ],
    ]);
});

test('a filter constrains the column named by attribute()', function (): void {
    $builder = Product::query();

    SelectFilter::make('state')->attribute('status')->apply($builder, 'active');

    expect($builder->toSql())->toContain('"status" = ?')
        ->and($builder->getBindings())->toBe(['active']);
});

test('table query drops a table-filter value the filter rejects', function (): void {
    $request = Request::create('/', 'GET', ['tf' => ['featured' => 'garbage']]);

    $query = TableQuery::fromRequest($request, [], 'demo', 25, [TernaryFilter::make('featured')]);

    expect($query->tableFilters)->toBe([]);
});

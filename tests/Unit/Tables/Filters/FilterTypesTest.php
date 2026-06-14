<?php
declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Tables\Filters\DateRangeFilter;
use Lattice\Lattice\Tables\Filters\Filter;
use Lattice\Lattice\Tables\Filters\TernaryFilter;
use Workbench\App\Models\Product;

test('ternary filter serializes its wire shape', function () {
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

test('a ternary filter applies a boolean constraint', function () {
    $builder = Product::query();
    TernaryFilter::make('featured')->apply($builder, 'true');
    expect($builder->toSql())->toContain('"featured" = ?')
        ->and($builder->getBindings())->toBe([true]);

    $other = Product::query();
    TernaryFilter::make('featured')->apply($other, 'false');
    expect($other->getBindings())->toBe([false]);
});

test('a ternary filter runs custom queries when provided', function () {
    $builder = Product::query();

    TernaryFilter::make('verified')
        ->queries(
            true: fn (Builder $query) => $query->whereNotNull('verified_at'),
            false: fn (Builder $query) => $query->whereNull('verified_at'),
        )
        ->apply($builder, 'true');

    expect($builder->toSql())->toContain('"verified_at" is not null');
});

test('a ternary filter rejects non-boolean values', function () {
    $filter = TernaryFilter::make('featured');
    expect($filter->accepts('true'))->toBeTrue()
        ->and($filter->accepts('false'))->toBeTrue()
        ->and($filter->accepts('garbage'))->toBeFalse();
});

test('date range filter serializes its wire shape', function () {
    expect(wire(DateRangeFilter::make('created_at')->label('Created')))
        ->toBe([
            'key' => 'created_at',
            'label' => 'Created',
            'type' => 'date-range',
            'props' => [],
        ]);
});

test('a date range filter applies from and until bounds', function () {
    $builder = Product::query();

    DateRangeFilter::make('created_at')->apply($builder, ['from' => '2026-01-01', 'until' => '2026-06-30']);

    expect($builder->toSql())->toContain('"created_at')->and($builder->toSql())->toContain('>=')
        ->and($builder->toSql())->toContain('<=')
        ->and($builder->getBindings())->toBe(['2026-01-01', '2026-06-30']);
});

test('a date range filter applies only the provided bound', function () {
    $builder = Product::query();

    DateRangeFilter::make('created_at')->apply($builder, ['from' => '2026-01-01']);

    expect($builder->getBindings())->toBe(['2026-01-01'])
        ->and($builder->toSql())->not->toContain('<=');
});

test('a generic filter serializes as a toggle', function () {
    expect(wire(Filter::make('high_value')->label('High value')))
        ->toBe([
            'key' => 'high_value',
            'label' => 'High value',
            'type' => 'toggle',
            'props' => [],
        ]);
});

test('a generic filter runs its query closure when toggled on', function () {
    $builder = Product::query();

    Filter::make('high_value')
        ->query(fn (Builder $query) => $query->where('price', '>', 1000))
        ->apply($builder, '1');

    expect($builder->toSql())->toContain('"price" > ?')
        ->and($builder->getBindings())->toBe([1000]);
});

test('a generic filter is a no-op when toggled off', function () {
    $builder = Product::query();

    Filter::make('high_value')
        ->query(fn (Builder $query) => $query->where('price', '>', 1000))
        ->apply($builder, '0');

    expect($builder->toSql())->not->toContain('where');
});

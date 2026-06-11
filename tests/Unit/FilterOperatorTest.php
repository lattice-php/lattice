<?php

declare(strict_types=1);

use Lattice\Lattice\Tables\Enums\FilterOperator;
use Lattice\Lattice\Tables\Enums\FilterType;
use Workbench\App\Models\Product;

it('builds a whereIn clause for the in operator', function (): void {
    $query = Product::query();

    FilterOperator::In->apply($query, FilterType::Text, 'status', 'active, archived ,');

    expect($query->toSql())->toContain('in (?, ?)')
        ->and($query->getBindings())->toBe(['active', 'archived']);
});

it('builds a whereNotIn clause for the not_in operator', function (): void {
    $query = Product::query();

    FilterOperator::NotIn->apply($query, FilterType::Text, 'status', 'active,archived');

    expect($query->toSql())->toContain('not in (?, ?)')
        ->and($query->getBindings())->toBe(['active', 'archived']);
});

it('keeps in and not_in out of every column operator set until a multi-value control exists', function (): void {
    foreach (FilterType::cases() as $type) {
        expect($type->operators())->not->toContain(FilterOperator::In);
        expect($type->operators())->not->toContain(FilterOperator::NotIn);
    }
});

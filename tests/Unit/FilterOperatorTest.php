<?php

declare(strict_types=1);

use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Tables\Enums\FilterType;
use Lattice\Lattice\Tables\FilterApplier;
use Workbench\App\Models\Product;

it('builds a whereIn clause for the in operator', function (): void {
    $query = Product::query();

    (new FilterApplier)->apply(Op::In, $query, FilterType::Text, 'status', 'active, archived ,');

    expect($query->toSql())->toContain('in (?, ?)')
        ->and($query->getBindings())->toBe(['active', 'archived']);
});

it('builds a whereNotIn clause for the not_in operator', function (): void {
    $query = Product::query();

    (new FilterApplier)->apply(Op::NotIn, $query, FilterType::Text, 'status', 'active,archived');

    expect($query->toSql())->toContain('not in (?, ?)')
        ->and($query->getBindings())->toBe(['active', 'archived']);
});

it('keeps in and not_in out of every column operator set until a multi-value control exists', function (): void {
    foreach (FilterType::cases() as $type) {
        expect($type->operators())->not->toContain(Op::In);
        expect($type->operators())->not->toContain(Op::NotIn);
    }
});

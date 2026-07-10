<?php

declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Tables\Attributes\AsFilter;
use Lattice\Lattice\Tables\Filters\Filter;

#[AsFilter('rating-slider')]
class CustomControlFilter extends Filter
{
    public int $max = 5;

    public function apply(Builder $builder, FormData $data): void {}
}

it('lets a filter declare a custom string control decoupled from FilterControl', function (): void {
    expect(wire(CustomControlFilter::make('rating')))->toBe([
        'type' => 'rating-slider',
        'key' => 'rating',
        'props' => ['max' => 5, 'label' => 'Rating'],
    ]);
});

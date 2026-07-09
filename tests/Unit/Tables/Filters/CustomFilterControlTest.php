<?php

declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Tables\Attributes\AsFilter;
use Lattice\Lattice\Tables\Filters\BaseFilter;

#[AsFilter('rating-slider')]
class CustomControlFilter extends BaseFilter
{
    public int $max = 5;

    public function apply(Builder $builder, mixed $value): void {}
}

it('lets a filter declare a custom string control decoupled from FilterControl', function (): void {
    expect(CustomControlFilter::make('rating')->toData()->jsonSerialize())->toBe([
        'key' => 'rating',
        'label' => 'Rating',
        'type' => 'rating-slider',
        'props' => ['max' => 5],
    ]);
});

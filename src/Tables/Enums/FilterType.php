<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Enums;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

enum FilterType: string
{
    case Text = 'text';
    case Number = 'number';
    case Date = 'date';
    case Boolean = 'boolean';

    /**
     * @return array<int, FilterOperator>
     */
    public function operators(): array
    {
        return array_values(array_filter(
            FilterOperator::cases(),
            fn (FilterOperator $operator): bool => in_array($this, $operator->appliesTo(), true),
        ));
    }

    public function defaultOperator(): FilterOperator
    {
        return $this === self::Text ? FilterOperator::Contains : FilterOperator::Equals;
    }

    /**
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $builder
     */
    public function applyEquals(Builder $builder, string $field, string $value): void
    {
        match ($this) {
            self::Date => $builder->whereDate($field, '=', $value),
            self::Boolean => $this->applyBooleanEquals($builder, $field, $value),
            default => $builder->where($field, $value),
        };
    }

    /**
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $builder
     */
    private function applyBooleanEquals(Builder $builder, string $field, string $value): void
    {
        $boolean = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

        if ($boolean !== null) {
            $builder->where($field, $boolean);
        }
    }
}

<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Lattice\Lattice\Tables\Enums\FilterOperator;
use Lattice\Lattice\Tables\Enums\FilterType;

/**
 * Spike (#127): the query-building behavior lifted out of FilterOperator. With
 * apply() living here, FilterOperator no longer depends on Eloquent and is pure
 * vocabulary + metadata — the precondition for merging it with the Eloquent-free
 * ConditionOperator into one shared `Op` enum. ConditionOperator::evaluate() is
 * the symmetric in-memory counterpart that would move to a ConditionEvaluator.
 */
final class FilterApplier
{
    /**
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $builder
     */
    public function apply(FilterOperator $operator, Builder $builder, FilterType $filterType, string $field, string $value): void
    {
        match ($operator) {
            FilterOperator::Contains => $builder->where($field, 'like', '%'.$this->escapeLike($value).'%'),
            FilterOperator::StartsWith => $builder->where($field, 'like', $this->escapeLike($value).'%'),
            FilterOperator::EndsWith => $builder->where($field, 'like', '%'.$this->escapeLike($value)),
            FilterOperator::Equals => $filterType->applyEquals($builder, $field, $value),
            FilterOperator::NotEquals => $this->compare($builder, $filterType, $field, '!=', $value),
            FilterOperator::GreaterThan => $this->compare($builder, $filterType, $field, '>', $value),
            FilterOperator::GreaterThanOrEqual => $this->compare($builder, $filterType, $field, '>=', $value),
            FilterOperator::LessThan => $this->compare($builder, $filterType, $field, '<', $value),
            FilterOperator::LessThanOrEqual => $this->compare($builder, $filterType, $field, '<=', $value),
            FilterOperator::In => $builder->whereIn($field, $this->splitList($value)),
            FilterOperator::NotIn => $builder->whereNotIn($field, $this->splitList($value)),
            FilterOperator::Before => $builder->whereDate($field, '<', $value),
            FilterOperator::After => $builder->whereDate($field, '>', $value),
            FilterOperator::Empty => $builder->where(function (Builder $query) use ($field): void {
                $query->whereNull($field)->orWhere($field, '');
            }),
            FilterOperator::Filled => $builder->whereNotNull($field)->where($field, '!=', ''),
        };
    }

    private function escapeLike(string $value): string
    {
        return str_replace(['%', '_'], ['\\%', '\\_'], $value);
    }

    /**
     * Split a comma-separated value into a trimmed, non-empty list for In/NotIn.
     *
     * @return array<int, string>
     */
    private function splitList(string $value): array
    {
        return array_values(array_filter(
            array_map('trim', explode(',', $value)),
            static fn (string $item): bool => $item !== '',
        ));
    }

    /**
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $builder
     */
    private function compare(Builder $builder, FilterType $filterType, string $field, string $sqlOperator, string $value): void
    {
        if ($filterType === FilterType::Date) {
            $builder->whereDate($field, $sqlOperator, $value);

            return;
        }

        $builder->where($field, $sqlOperator, $value);
    }
}

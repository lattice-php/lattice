<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Tables\Enums\FilterType;

/**
 * Builds the SQL for a table filter operator. The Tables-side counterpart to
 * ConditionEvaluator (in-memory). Keeping this behavior out of the Op enum is
 * what lets the shared operator vocabulary stay dependency-free.
 */
final class FilterApplier
{
    /**
     * @param  Builder<*>  $builder
     */
    public function apply(Op $operator, Builder $builder, FilterType $filterType, string $field, string $value): void
    {
        match ($operator) {
            Op::Contains => $builder->where($field, 'like', '%'.$this->escapeLike($value).'%'),
            Op::StartsWith => $builder->where($field, 'like', $this->escapeLike($value).'%'),
            Op::EndsWith => $builder->where($field, 'like', '%'.$this->escapeLike($value)),
            Op::Equals => $filterType->applyEquals($builder, $field, $value),
            Op::NotEquals => $this->compare($builder, $filterType, $field, '!=', $value),
            Op::GreaterThan => $this->compare($builder, $filterType, $field, '>', $value),
            Op::GreaterThanOrEqual => $this->compare($builder, $filterType, $field, '>=', $value),
            Op::LessThan => $this->compare($builder, $filterType, $field, '<', $value),
            Op::LessThanOrEqual => $this->compare($builder, $filterType, $field, '<=', $value),
            Op::In => $builder->whereIn($field, $this->splitList($value)),
            Op::NotIn => $builder->whereNotIn($field, $this->splitList($value)),
            Op::Before => $builder->whereDate($field, '<', $value),
            Op::After => $builder->whereDate($field, '>', $value),
            Op::Empty => $builder->where(function (Builder $query) use ($field): void {
                $query->whereNull($field)->orWhere($field, '');
            }),
            Op::Filled => $builder->whereNotNull($field)->where($field, '!=', ''),
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
            array_map(trim(...), explode(',', $value)),
            static fn (string $item): bool => $item !== '',
        ));
    }

    /**
     * @param  Builder<*>  $builder
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

<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Enums;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

enum FilterOperator: string
{
    case Contains = 'contains';
    case StartsWith = 'starts_with';
    case EndsWith = 'ends_with';
    case Equals = 'eq';
    case NotEquals = 'neq';
    case GreaterThan = 'gt';
    case GreaterThanOrEqual = 'gte';
    case LessThan = 'lt';
    case LessThanOrEqual = 'lte';
    case In = 'in';
    case NotIn = 'not_in';
    case Before = 'before';
    case After = 'after';
    case Empty = 'empty';
    case Filled = 'filled';

    /**
     * The column types this operator can be offered on. Empty means the operator
     * is not surfaced through a column's default operator set yet (In/NotIn need
     * a multi-value control, tracked under the dedicated-filters work).
     *
     * @return array<int, FilterType>
     */
    public function appliesTo(): array
    {
        return match ($this) {
            self::Contains, self::StartsWith, self::EndsWith => [FilterType::Text],
            self::Equals, self::Empty, self::Filled => [FilterType::Text, FilterType::Number, FilterType::Date, FilterType::Boolean],
            self::NotEquals => [FilterType::Text, FilterType::Number],
            self::GreaterThan, self::GreaterThanOrEqual, self::LessThan, self::LessThanOrEqual => [FilterType::Number],
            self::Before, self::After => [FilterType::Date],
            self::In, self::NotIn => [],
        };
    }

    public function requiresValue(): bool
    {
        return ! in_array($this, [self::Empty, self::Filled], true);
    }

    /**
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $builder
     */
    public function apply(Builder $builder, FilterType $filterType, string $field, string $value): void
    {
        match ($this) {
            self::Contains => $builder->where($field, 'like', '%'.$this->escapeLike($value).'%'),
            self::StartsWith => $builder->where($field, 'like', $this->escapeLike($value).'%'),
            self::EndsWith => $builder->where($field, 'like', '%'.$this->escapeLike($value)),
            self::Equals => $filterType->applyEquals($builder, $field, $value),
            self::NotEquals => $this->compare($builder, $filterType, $field, '!=', $value),
            self::GreaterThan => $this->compare($builder, $filterType, $field, '>', $value),
            self::GreaterThanOrEqual => $this->compare($builder, $filterType, $field, '>=', $value),
            self::LessThan => $this->compare($builder, $filterType, $field, '<', $value),
            self::LessThanOrEqual => $this->compare($builder, $filterType, $field, '<=', $value),
            self::In => $builder->whereIn($field, $this->splitList($value)),
            self::NotIn => $builder->whereNotIn($field, $this->splitList($value)),
            self::Before => $builder->whereDate($field, '<', $value),
            self::After => $builder->whereDate($field, '>', $value),
            self::Empty => $builder->where(function (Builder $query) use ($field): void {
                $query->whereNull($field)->orWhere($field, '');
            }),
            self::Filled => $builder->whereNotNull($field)->where($field, '!=', ''),
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

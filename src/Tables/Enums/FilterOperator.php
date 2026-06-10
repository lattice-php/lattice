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
    case Before = 'before';
    case After = 'after';
    case Empty = 'empty';
    case Filled = 'filled';

    /**
     * @return array<int, ControlType>
     */
    public function appliesTo(): array
    {
        return match ($this) {
            self::Contains, self::StartsWith, self::EndsWith => [ControlType::Text],
            self::Equals, self::Empty, self::Filled => [ControlType::Text, ControlType::Number, ControlType::Date, ControlType::Boolean],
            self::NotEquals => [ControlType::Text, ControlType::Number],
            self::GreaterThan, self::GreaterThanOrEqual, self::LessThan, self::LessThanOrEqual => [ControlType::Number],
            self::Before, self::After => [ControlType::Date],
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
    public function apply(Builder $builder, ControlType $controlType, string $field, string $value): void
    {
        match ($this) {
            self::Contains => $builder->where($field, 'like', '%'.$this->escapeLike($value).'%'),
            self::StartsWith => $builder->where($field, 'like', $this->escapeLike($value).'%'),
            self::EndsWith => $builder->where($field, 'like', '%'.$this->escapeLike($value)),
            self::Equals => $controlType->applyEquals($builder, $field, $value),
            self::NotEquals => $this->compare($builder, $controlType, $field, '!=', $value),
            self::GreaterThan => $this->compare($builder, $controlType, $field, '>', $value),
            self::GreaterThanOrEqual => $this->compare($builder, $controlType, $field, '>=', $value),
            self::LessThan => $this->compare($builder, $controlType, $field, '<', $value),
            self::LessThanOrEqual => $this->compare($builder, $controlType, $field, '<=', $value),
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
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $builder
     */
    private function compare(Builder $builder, ControlType $controlType, string $field, string $sqlOperator, string $value): void
    {
        if ($controlType === ControlType::Date) {
            $builder->whereDate($field, $sqlOperator, $value);

            return;
        }

        $builder->where($field, $sqlOperator, $value);
    }
}

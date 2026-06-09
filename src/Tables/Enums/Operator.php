<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables\Enums;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

enum Operator: string
{
    case Contains = 'contains';
    case Equals = 'equals';
    case NotEquals = 'not_equals';
    case GreaterThan = 'gt';
    case GreaterThanOrEqual = 'gte';
    case LessThan = 'lt';
    case LessThanOrEqual = 'lte';
    case Before = 'before';
    case After = 'after';

    /**
     * @return array<int, ControlType>
     */
    public function appliesTo(): array
    {
        return match ($this) {
            self::Contains => [ControlType::Text],
            self::Equals => [ControlType::Text, ControlType::Number, ControlType::Date, ControlType::Boolean],
            self::NotEquals => [ControlType::Text, ControlType::Number],
            self::GreaterThan, self::GreaterThanOrEqual, self::LessThan, self::LessThanOrEqual => [ControlType::Number],
            self::Before, self::After => [ControlType::Date],
        };
    }

    /**
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $builder
     */
    public function apply(Builder $builder, ControlType $controlType, string $field, string $value): void
    {
        match ($this) {
            self::Contains => $builder->where($field, 'like', '%'.str_replace(['%', '_'], ['\\%', '\\_'], $value).'%'),
            self::Equals => $controlType->applyEquals($builder, $field, $value),
            self::NotEquals => $this->compare($builder, $controlType, $field, '!=', $value),
            self::GreaterThan => $this->compare($builder, $controlType, $field, '>', $value),
            self::GreaterThanOrEqual => $this->compare($builder, $controlType, $field, '>=', $value),
            self::LessThan => $this->compare($builder, $controlType, $field, '<', $value),
            self::LessThanOrEqual => $this->compare($builder, $controlType, $field, '<=', $value),
            self::Before => $builder->whereDate($field, '<', $value),
            self::After => $builder->whereDate($field, '>', $value),
        };
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

<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Enums;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Enums\Op;

#[TypeScript]
enum FilterType: string
{
    case Text = 'text';
    case Number = 'number';
    case Date = 'date';
    case Boolean = 'boolean';

    /**
     * The operators offered by default for this value type. A column may narrow
     * this set via Filterable::availableOperators().
     *
     * @return array<int, Op>
     */
    public function operators(): array
    {
        return match ($this) {
            self::Text => [
                Op::Contains,
                Op::StartsWith,
                Op::EndsWith,
                Op::Equals,
                Op::NotEquals,
                Op::Empty,
                Op::Filled,
            ],
            self::Number => [
                Op::Equals,
                Op::NotEquals,
                Op::GreaterThan,
                Op::GreaterThanOrEqual,
                Op::LessThan,
                Op::LessThanOrEqual,
                Op::Empty,
                Op::Filled,
            ],
            self::Date => [
                Op::Equals,
                Op::Before,
                Op::After,
                Op::Empty,
                Op::Filled,
            ],
            self::Boolean => [
                Op::Equals,
                Op::Empty,
                Op::Filled,
            ],
        };
    }

    public function defaultOperator(): Op
    {
        return $this === self::Text ? Op::Contains : Op::Equals;
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

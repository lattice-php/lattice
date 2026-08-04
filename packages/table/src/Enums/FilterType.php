<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Enums;

use DateTimeImmutable;
use Illuminate\Database\Eloquent\Builder;
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

    public function acceptsValue(string $value): bool
    {
        return match ($this) {
            self::Date => self::dateFrom($value) instanceof DateTimeImmutable,
            self::Boolean => self::booleanFrom($value) !== null,
            default => true,
        };
    }

    /**
     * @param  Builder<*>  $builder
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
     * @param  Builder<*>  $builder
     */
    private function applyBooleanEquals(Builder $builder, string $field, string $value): void
    {
        $boolean = self::booleanFrom($value);

        if ($boolean === null) {
            $builder->whereRaw('0 = 1');

            return;
        }

        $builder->where($field, $boolean);
    }

    private static function booleanFrom(string $value): ?bool
    {
        $boolean = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

        return is_bool($boolean) ? $boolean : null;
    }

    private static function dateFrom(string $value): ?DateTimeImmutable
    {
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);
        $errors = DateTimeImmutable::getLastErrors();

        if ($date === false || ($errors !== false && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))) {
            return null;
        }

        return $date;
    }
}

<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

use BackedEnum;
use Illuminate\Support\Str;
use Lattice\Lattice\Core\Contracts\HasLabel;
use Lattice\Lattice\Core\Option;
use UnitEnum;

trait HasOptions
{
    /**
     * @var list<Option>
     */
    public array $options = [];

    public static function option(string $label, string $value): Option
    {
        return new Option($label, $value);
    }

    /**
     * Accepts {@see Option} instances or raw `{label, value}` arrays, normalizing
     * both to the value objects the wire shape is generated from.
     *
     * @param  array<int, Option|array{label: string, value: string}>  $options
     */
    public function options(array $options): static
    {
        $this->options = array_values(array_map(
            static fn (Option|array $option): Option => $option instanceof Option
                ? $option
                : new Option((string) $option['label'], (string) $option['value']),
            $options,
        ));

        return $this;
    }

    /**
     * Build options from an enum. Pass the enum class for all cases, or an array
     * of specific cases for a subset. Labels come from the HasLabel contract
     * (which may return a translated string) and otherwise default to the
     * humanised case name.
     *
     * @param  class-string<UnitEnum>|array<int, UnitEnum>  $enum
     */
    public function enum(string|array $enum): static
    {
        $cases = is_string($enum) ? $enum::cases() : $enum;

        return $this->options(array_map(
            static fn (UnitEnum $case): Option => self::option(
                $case instanceof HasLabel ? $case->getLabel() : Str::headline($case->name),
                $case instanceof BackedEnum ? (string) $case->value : $case->name,
            ),
            $cases,
        ));
    }
}

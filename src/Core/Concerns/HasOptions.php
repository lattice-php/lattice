<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

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
     * Accepts an enum class-string, an associative `value => label` array, or a
     * list of {@see Option} instances / `{label, value}` arrays / enum cases.
     *
     * @param  class-string<UnitEnum>|array<mixed>  $options
     */
    public function options(array|string $options): static
    {
        $this->options = Option::expand($options);

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
        return $this->options($enum);
    }
}

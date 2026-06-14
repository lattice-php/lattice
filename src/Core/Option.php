<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core;

use BackedEnum;
use Illuminate\Support\Str;
use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Contracts\HasLabel;
use UnitEnum;

/**
 * A `{ label, value }` pair backing every option-driven control (choice, select,
 * segmented control). Generated to TypeScript so the client shares one `Option`
 * type rather than re-declaring the shape per field.
 */
#[TypeScript]
final readonly class Option implements JsonSerializable
{
    public function __construct(
        public string $label,
        public string $value,
    ) {}

    /**
     * Normalize a flexible options input into a list of {@see Option}:
     * - an enum class-string (all cases),
     * - an associative `value => label` array,
     * - a list of {@see Option}, `{label, value}` arrays, or enum cases.
     *
     * @param  class-string<UnitEnum>|array<mixed>  $options
     * @return list<Option>
     */
    public static function expand(array|string $options): array
    {
        if (is_string($options)) {
            $options = $options::cases();
        }

        if (! array_is_list($options)) {
            return array_map(
                static fn (mixed $label, int|string $value): self => new self((string) $label, (string) $value),
                array_values($options),
                array_keys($options),
            );
        }

        return array_map(static fn (mixed $option): self => self::from($option), $options);
    }

    /**
     * @param  Option|array{label: string, value: string}|UnitEnum  $option
     */
    private static function from(mixed $option): self
    {
        if ($option instanceof self) {
            return $option;
        }

        if ($option instanceof UnitEnum) {
            return new self(
                $option instanceof HasLabel ? $option->getLabel() : Str::headline($option->name),
                $option instanceof BackedEnum ? (string) $option->value : $option->name,
            );
        }

        return new self((string) $option['label'], (string) $option['value']);
    }

    /**
     * @return array{label: string, value: string}
     */
    public function jsonSerialize(): array
    {
        return [
            'label' => $this->label,
            'value' => $this->value,
        ];
    }
}

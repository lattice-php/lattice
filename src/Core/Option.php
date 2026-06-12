<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core;

use JsonSerializable;

/**
 * A `{ label, value }` pair backing every option-driven control (choice, select,
 * segmented control). Generated to TypeScript so the client shares one `Option`
 * type rather than re-declaring the shape per field.
 */
final readonly class Option implements JsonSerializable
{
    public function __construct(
        public string $label,
        public string $value,
    ) {}

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

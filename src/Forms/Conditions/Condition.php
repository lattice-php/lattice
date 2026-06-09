<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Forms\Conditions;

use Bambamboole\Lattice\Forms\Enums\Op;
use Bambamboole\Lattice\Forms\FormData;
use JsonSerializable;

final class Condition implements JsonSerializable
{
    public function __construct(
        public readonly string $field,
        public readonly Op $operator,
        public readonly mixed $value,
    ) {}

    public function matches(FormData $data): bool
    {
        return $this->operator->evaluate($data->get($this->field), $this->value);
    }

    /**
     * @return array{field: string, operator: string, value: mixed}
     */
    public function jsonSerialize(): array
    {
        return [
            'field' => $this->field,
            'operator' => $this->operator->value,
            'value' => $this->value,
        ];
    }
}

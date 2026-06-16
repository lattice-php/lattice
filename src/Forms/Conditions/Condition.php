<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Conditions;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Forms\FormData;

#[TypeScript]
final readonly class Condition implements JsonSerializable
{
    public function __construct(
        public string $field,
        public Op $operator,
        public mixed $value,
    ) {}

    public function matches(FormData $data): bool
    {
        return (new ConditionEvaluator)->evaluate($this->operator, $data->get($this->field), $this->value);
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

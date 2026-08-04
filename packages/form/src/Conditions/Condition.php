<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Conditions;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Forms\FormData;

#[TypeScript]
final readonly class Condition
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
}

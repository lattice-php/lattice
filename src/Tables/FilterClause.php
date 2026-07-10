<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Enums\Op;

#[TypeScript]
final readonly class FilterClause
{
    public function __construct(
        public string $field,
        public string $operator,
        public string $value,
    ) {}

    public static function fromString(string $clause): self
    {
        $parts = explode(':', $clause, 3);

        return new self(
            $parts[0],
            $parts[1] ?? '',
            isset($parts[2]) ? rawurldecode($parts[2]) : '',
        );
    }

    public function isComplete(): bool
    {
        if ($this->field === '' || $this->operator === '') {
            return false;
        }

        if (Op::tryFrom($this->operator)?->requiresValue() === false) {
            return true;
        }

        return $this->value !== '';
    }
}

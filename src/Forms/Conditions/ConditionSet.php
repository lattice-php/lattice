<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Forms\Conditions;

use Bambamboole\Lattice\Forms\FormData;
use JsonSerializable;

final class ConditionSet implements JsonSerializable
{
    /**
     * @var array<int, Condition>
     */
    private array $conditions = [];

    public function add(Condition $condition): void
    {
        $this->conditions[] = $condition;
    }

    public function anyMatches(FormData $data): bool
    {
        foreach ($this->conditions as $condition) {
            if ($condition->matches($data)) {
                return true;
            }
        }

        return false;
    }

    public function allMatch(FormData $data): bool
    {
        foreach ($this->conditions as $condition) {
            if (! $condition->matches($data)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function jsonSerialize(): array
    {
        return array_map(
            static fn (Condition $condition): array => $condition->jsonSerialize(),
            $this->conditions,
        );
    }
}

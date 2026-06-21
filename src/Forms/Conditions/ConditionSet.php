<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Conditions;

use JsonSerializable;
use Lattice\Lattice\Forms\FormData;

final class ConditionSet implements JsonSerializable
{
    /**
     * @var list<Condition>
     */
    private array $conditions = [];

    public function add(Condition $condition): void
    {
        $this->conditions[] = $condition;
    }

    /**
     * @return list<Condition>
     */
    public function all(): array
    {
        return $this->conditions;
    }

    public function anyMatches(FormData $data): bool
    {
        return array_any($this->conditions, fn (Condition $condition): bool => $condition->matches($data));
    }

    public function allMatch(FormData $data): bool
    {
        return array_all($this->conditions, fn (Condition $condition): bool => $condition->matches($data));
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

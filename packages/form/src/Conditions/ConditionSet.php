<?php
declare(strict_types=1);

namespace Lattice\Form\Conditions;

use JsonSerializable;
use Lattice\Form\FormData;

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
     * @return list<Condition>
     */
    public function jsonSerialize(): array
    {
        return $this->conditions;
    }
}

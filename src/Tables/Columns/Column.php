<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables\Columns;

use JsonSerializable;

/**
 * @phpstan-consistent-constructor
 */
class Column implements JsonSerializable
{
    protected string $label;

    protected bool $sortable = false;

    protected bool $filterable = false;

    protected ?string $defaultOperator = null;

    public function __construct(public readonly string $key)
    {
        $this->label = str($key)->headline()->toString();
    }

    public static function make(string $key): static
    {
        return new static($key);
    }

    public function label(string $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function sortable(bool $sortable = true): static
    {
        $this->sortable = $sortable;

        return $this;
    }

    public function filterable(): static
    {
        $this->filterable = true;

        return $this;
    }

    public function filterableExact(): static
    {
        $this->filterable = true;
        $this->defaultOperator = 'equals';

        return $this;
    }

    public function isSortable(): bool
    {
        return $this->sortable;
    }

    public function isFilterable(): bool
    {
        return $this->filterable;
    }

    public function filterControlType(): string
    {
        return 'text';
    }

    /**
     * @return array<int, string>
     */
    public function filterOperators(): array
    {
        return match ($this->filterControlType()) {
            'number' => ['equals', 'not_equals', 'gt', 'gte', 'lt', 'lte'],
            'date' => ['equals', 'before', 'after'],
            'boolean' => ['equals'],
            default => ['contains', 'equals', 'not_equals'],
        };
    }

    public function defaultFilterOperator(): string
    {
        return $this->defaultOperator ?? ($this->filterControlType() === 'text' ? 'contains' : 'equals');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return array_filter([
            'key' => $this->key,
            'label' => $this->label,
            'sortable' => $this->sortable ?: null,
            'filter' => $this->isFilterable() ? [
                'enabled' => true,
                'type' => $this->filterControlType(),
                'operators' => $this->filterOperators(),
                'defaultOperator' => $this->defaultFilterOperator(),
            ] : null,
        ], fn (mixed $value): bool => $value !== null);
    }

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}

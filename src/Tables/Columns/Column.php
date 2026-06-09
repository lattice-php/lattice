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

    protected ?string $filterStrategy = null;

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
        $this->filterStrategy = 'exact';

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

    public function filterType(): ?string
    {
        if (! $this->filterable) {
            return null;
        }

        return $this->filterStrategy ?? $this->defaultFilterType();
    }

    protected function defaultFilterType(): string
    {
        return 'partial';
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
                'type' => $this->filterType(),
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

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

    protected ?string $filter = null;

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

    public function filterable(string $type = 'partial'): static
    {
        $this->filter = $type;

        return $this;
    }

    public function filterableExact(): static
    {
        return $this->filterable('exact');
    }

    public function filterableDate(): static
    {
        return $this->filterable('date');
    }

    public function filterableBoolean(): static
    {
        return $this->filterable('boolean');
    }

    public function isSortable(): bool
    {
        return $this->sortable;
    }

    public function isFilterable(): bool
    {
        return $this->filter !== null;
    }

    public function filterType(): ?string
    {
        return $this->filter;
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
            'filter' => $this->filter === null ? null : [
                'enabled' => true,
                'type' => $this->filter,
            ],
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

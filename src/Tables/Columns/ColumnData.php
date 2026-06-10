<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use JsonSerializable;
use Lattice\Lattice\Tables\Enums\ColumnType;

/**
 * The wire shape of a table column. Built by each Column's toData() and
 * generated to TypeScript. Fields not applicable to a column type stay null
 * and are stripped from the payload.
 */
final readonly class ColumnData implements JsonSerializable
{
    /**
     * @param  array{format: string|null}|null  $date
     * @param  array{href: string|null, external: bool}|null  $link
     * @param  array<int, ColumnData>|null  $columns
     */
    public function __construct(
        public string $key,
        public string $label,
        public ColumnType $type,
        public ?bool $sortable = null,
        public ?ColumnFilter $filter = null,
        public ?array $date = null,
        public ?bool $copyable = null,
        public ?array $link = null,
        public ?array $columns = null,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return array_filter([
            'key' => $this->key,
            'label' => $this->label,
            'sortable' => $this->sortable,
            'filter' => $this->filter?->toArray(),
            'type' => $this->type->value,
            'date' => $this->date,
            'copyable' => $this->copyable,
            'link' => $this->link,
            'columns' => $this->columns === null
                ? null
                : array_map(fn (self $column): array => $column->toArray(), $this->columns),
        ], fn (mixed $value): bool => $value !== null && $value !== []);
    }

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}

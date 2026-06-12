<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Tables\Enums\ColumnType;

/**
 * The wire shape of a table column. Built by each Column's toData() and
 * generated to TypeScript. Every field is always present; fields not
 * applicable to a column type are null, so the generated type matches the
 * payload exactly.
 */
#[TypeScript]
final readonly class ColumnData implements JsonSerializable
{
    /**
     * @param  array{format: string|null}|null  $date
     * @param  array{href: string|null, external: bool}|null  $link
     * @param  array<int, ColumnData>|null  $columns
     * @param  array<string, mixed>|null  $props
     */
    public function __construct(
        public string $key,
        public string $label,
        public ColumnType|string $type,
        public ?bool $sortable = null,
        public ?ColumnFilter $filter = null,
        public ?array $date = null,
        public ?bool $copyable = null,
        public ?array $link = null,
        public ?array $columns = null,
        public ?array $props = null,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return [
            'key' => $this->key,
            'label' => $this->label,
            'type' => $this->type instanceof ColumnType ? $this->type->value : $this->type,
            'sortable' => $this->sortable,
            'filter' => $this->filter,
            'date' => $this->date,
            'copyable' => $this->copyable,
            'link' => $this->link,
            'columns' => $this->columns,
            'props' => $this->props,
        ];
    }
}

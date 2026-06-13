<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Enums\ColumnWidth;
use Lattice\Lattice\Tables\Enums\ColumnType;

/**
 * The common wire shape of a table column. Built by each Column's toData(). The
 * type-specific payload lives in `props`, a per-column ColumnProps value object;
 * client code narrows it via `ColumnPropsOf<type>`.
 */
#[TypeScript]
final readonly class ColumnData implements JsonSerializable
{
    /**
     * @param  array<int, ColumnData>|null  $columns
     */
    public function __construct(
        public string $key,
        public string $label,
        public ColumnType|string $type,
        public ColumnWidth $width = ColumnWidth::Md,
        public ?bool $sortable = null,
        public ?ColumnFilter $filter = null,
        public ?array $columns = null,
        public ?ColumnProps $props = null,
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
            'width' => $this->width->value,
            'sortable' => $this->sortable,
            'filter' => $this->filter,
            'columns' => $this->columns,
            'props' => $this->props,
        ];
    }
}

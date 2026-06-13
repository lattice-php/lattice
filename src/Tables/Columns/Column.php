<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Illuminate\Support\Collection;
use JsonSerializable;
use Lattice\Lattice\Core\Enums\ColumnWidth;

/**
 * @phpstan-consistent-constructor
 */
abstract class Column implements JsonSerializable
{
    protected string $label;

    protected ?ColumnWidth $width = null;

    public function __construct(public readonly string $key)
    {
        $this->label = str($key)->headline()->toString();
    }

    public static function make(string $key): static
    {
        return new static($key);
    }

    /**
     * @param  array<int, Column>  $columns
     * @return Collection<string, Column>
     */
    public static function index(array $columns): Collection
    {
        return collect($columns)->keyBy(fn (Column $column): string => $column->key);
    }

    public function label(string $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function width(ColumnWidth $width): static
    {
        $this->width = $width;

        return $this;
    }

    abstract public function toData(): ColumnData;

    protected function resolvedWidth(): ColumnWidth
    {
        return $this->width ?? $this->defaultWidth();
    }

    protected function defaultWidth(): ColumnWidth
    {
        return ColumnWidth::Md;
    }

    protected function sortableValue(): ?bool
    {
        return $this instanceof Sortable && $this->isSortable() ? true : null;
    }

    protected function filterValue(): ?ColumnFilter
    {
        if (! $this instanceof Filterable || ! $this->isFilterable()) {
            return null;
        }

        return new ColumnFilter(
            enabled: true,
            type: $this->filterType(),
            operators: $this->availableOperators(),
            defaultOperator: $this->defaultFilterOperator(),
        );
    }

    public function jsonSerialize(): ColumnData
    {
        return $this->toData();
    }
}

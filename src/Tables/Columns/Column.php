<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Illuminate\Support\Collection;
use JsonSerializable;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Components\Concerns\ReflectsWireProps;
use Lattice\Lattice\Core\Enums\ColumnWidth;
use Lattice\Lattice\Tables\Enums\ColumnAlign;
use Lattice\Lattice\Tables\Enums\ColumnType;

/**
 * @phpstan-consistent-constructor
 */
abstract class Column implements JsonSerializable
{
    use ReflectsWireProps;

    protected string $label;

    protected ?ColumnWidth $width = null;

    protected ?ColumnAlign $align = null;

    public function __construct(protected readonly string $key)
    {
        $this->label = str($key)->headline()->toString();
    }

    public function key(): string
    {
        return $this->key;
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
        return collect($columns)->keyBy(fn (Column $column): string => $column->key());
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

    public function align(ColumnAlign $align): static
    {
        $this->align = $align;

        return $this;
    }

    /**
     * @return list<ColumnFilterOption>
     */
    public function filterClauseOptions(): array
    {
        return [];
    }

    /**
     * Reflects the column's public properties into the wire shape, mirroring how
     * components serialize their props. The common fields (key, label, type,
     * width, sortable, filter) are built here; everything a column adds as a
     * public property becomes a type-specific prop.
     */
    public function toData(): ColumnData
    {
        $props = $this->wireProps();

        return new ColumnData(
            key: $this->key,
            label: $this->label,
            type: $this->resolvedType(),
            width: $this->resolvedWidth(),
            align: $this->resolvedAlign(),
            sortable: $this->sortableValue(),
            filter: $this->filterValue(),
            props: $props === [] ? null : $props,
        );
    }

    /**
     * The column's type, hydrated from the #[AsColumn] attribute so it is
     * declared once. Built-in types resolve to the ColumnType enum, custom
     * types to their string.
     */
    protected function resolvedType(): ColumnType|string
    {
        $type = AsComponent::typeForClass(static::class);

        return ColumnType::tryFrom($type) ?? $type;
    }

    protected function resolvedWidth(): ColumnWidth
    {
        return $this->width ?? $this->defaultWidth();
    }

    protected function defaultWidth(): ColumnWidth
    {
        return ColumnWidth::Md;
    }

    protected function resolvedAlign(): ColumnAlign
    {
        return $this->align ?? $this->defaultAlign();
    }

    protected function defaultAlign(): ColumnAlign
    {
        return ColumnAlign::Start;
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
            control: $this->filterControl(),
            options: $this->filterSelectOptions(),
            multiple: $this->filterMultiple(),
            searchable: $this->filterSearchable(),
            clauseOptions: $this->filterClauseOptions(),
        );
    }

    public function jsonSerialize(): ColumnData
    {
        return $this->toData();
    }
}

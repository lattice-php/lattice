<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Illuminate\Support\Collection;
use JsonSerializable;
use Lattice\Lattice\Tables\Contracts\Filterable;
use Lattice\Lattice\Tables\Contracts\Sortable;
use Lattice\Lattice\Tables\Enums\ColumnAlign;
use Lattice\Lattice\Ui\Components\Concerns\SerializesWireNode;
use Lattice\Lattice\Ui\Concerns\GatesRendering;
use Lattice\Lattice\Ui\Concerns\HasLabel;
use Lattice\Lattice\Ui\Contracts\Renderable;
use Lattice\Lattice\Ui\Enums\ColumnWidth;

/**
 * @phpstan-consistent-constructor
 */
abstract class Column implements JsonSerializable, Renderable
{
    use GatesRendering;
    use HasLabel;
    use SerializesWireNode;

    public ColumnWidth $width = ColumnWidth::Md;

    public ColumnAlign $align = ColumnAlign::Start;

    /** Generation-source declaration only; the wire value is computed in {@see self::decorateProps()}. */
    public bool $sortable = false;

    public bool $toggleable = false;

    public bool $hiddenByDefault = false;

    /** Generation-source declaration only; the wire value is computed in {@see self::decorateProps()}. */
    public ?ColumnFilter $filter = null;

    public function __construct(protected readonly string $key)
    {
        $this->label = str($key)->headline()->toString();
    }

    public static function make(string $key): static
    {
        return new static($key);
    }

    public function key(): string
    {
        return $this->key;
    }

    /**
     * @param  array<int, Column>  $columns
     * @return Collection<string, Column>
     */
    public static function index(array $columns): Collection
    {
        return collect($columns)->keyBy(fn (Column $column): string => $column->key());
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

    public function toggleable(bool $hiddenByDefault = false): static
    {
        $this->toggleable = true;
        $this->hiddenByDefault = $hiddenByDefault;

        return $this;
    }

    /**
     * @return list<ColumnFilterOption>
     */
    public function filterClauseOptions(): array
    {
        return [];
    }

    protected function sortableValue(): bool
    {
        return $this instanceof Sortable && $this->isSortable();
    }

    protected function filterValue(): ?ColumnFilter
    {
        if (! $this instanceof Filterable || ! $this->isFilterable()) {
            return null;
        }

        return new ColumnFilter(
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

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    protected function decorateProps(array $props): array
    {
        $props['sortable'] = $this->sortableValue();
        $props['filter'] = $this->filterValue();

        return $props;
    }
}

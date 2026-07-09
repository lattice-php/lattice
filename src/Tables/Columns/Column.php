<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Illuminate\Support\Collection;
use JsonSerializable;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Components\Concerns\SerializesToWire;
use Lattice\Lattice\Core\Concerns\GatesRendering;
use Lattice\Lattice\Core\Contracts\Renderable;
use Lattice\Lattice\Core\Enums\ColumnWidth;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Tables\Enums\ColumnAlign;

/**
 * @phpstan-consistent-constructor
 */
abstract class Column implements JsonSerializable, Renderable
{
    use GatesRendering;
    use SerializesToWire;

    public string $label;

    public ColumnWidth $width = ColumnWidth::Md;

    public ColumnAlign $align = ColumnAlign::Start;

    public ?bool $sortable = null;

    public ?bool $toggleable = null;

    public ?bool $hiddenByDefault = null;

    public ?ColumnFilter $filter = null;

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

    public function visible(bool $visible = true): static
    {
        return $this->when($visible);
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
        $this->hiddenByDefault = $hiddenByDefault ? true : null;

        return $this;
    }

    /**
     * @return list<ColumnFilterOption>
     */
    public function filterClauseOptions(): array
    {
        return [];
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

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        $this->sortable = $this->sortableValue();
        $this->filter = $this->filterValue();

        return [
            'type' => AsComponent::typeForClass(static::class),
            'key' => $this->key,
            'props' => Wire::map($this->decorateProps($this->wireProps())),
        ];
    }
}

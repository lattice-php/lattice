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

    protected string $label;

    protected ?ColumnWidth $width = null;

    protected ?ColumnAlign $align = null;

    protected bool $toggleable = false;

    protected bool $hiddenByDefault = false;

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

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return [
            'type' => AsComponent::typeForClass(static::class),
            'key' => $this->key,
            'props' => Wire::map($this->decorateProps($this->wireProps())),
        ];
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    protected function decorateProps(array $props): array
    {
        return [
            ...$props,
            'label' => $this->label,
            'width' => $this->resolvedWidth()->value,
            'align' => $this->resolvedAlign()->value,
            'sortable' => $this->sortableValue(),
            'toggleable' => $this->toggleable ? true : null,
            'hiddenByDefault' => $this->hiddenByDefault ? true : null,
            'filter' => $this->filterValue(),
        ];
    }
}

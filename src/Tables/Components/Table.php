<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Components;

use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\IsInteractive;
use Lattice\Lattice\Core\Concerns\FiltersRenderableComponents;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Filters\BaseFilter;
use Lattice\Lattice\Tables\Filters\FilterData;
use Lattice\Lattice\Tables\TableDefinition;
use Lattice\Lattice\Tables\TableQuery;
use Lattice\Lattice\Tables\TableRegistry;
use Lattice\Lattice\Tables\TableResult;

#[AsComponent('table')]
class Table extends Component
{
    use FiltersRenderableComponents;
    use IsInteractive;

    public ?string $endpoint = null;

    /**
     * @var array<int, array<string, mixed>>
     */
    public array $columns = [];

    /**
     * @var array<int, FilterData>
     */
    public array $filters = [];

    public ?string $layout = null;

    /**
     * @var array<int, Action>
     */
    public array $bulkActions = [];

    public ?bool $striped = null;

    public ?bool $lazy = null;

    public ?bool $resizableColumns = null;

    public bool $resizeIndicator = false;

    public string $actionsLabel = 'Actions';

    public string $emptyLabel = 'No results';

    /**
     * The serialized {data, pagination, state} result, projected into props
     * verbatim so empty data/pagination stay on the wire — typed reflection
     * would otherwise skip them.
     *
     * @var array<string, mixed>|null
     */
    protected ?array $result = null;

    public static function make(string $id): static
    {
        return (new static)->id($id);
    }

    /**
     * @param  class-string<TableDefinition>  $table
     * @param  array<string, mixed>  $context
     */
    public static function use(string $table, array $context = []): static
    {
        /** @var static $registered */
        $registered = app(TableRegistry::class)->component($table, $context);

        return clone $registered;
    }

    /**
     * @param  class-string<TableDefinition>  $table
     * @param  array<string, mixed>  $context
     */
    public static function lazy(string $table, array $context = []): static
    {
        /** @var static $registered */
        $registered = app(TableRegistry::class)->lazyComponent($table, $context);

        return clone $registered;
    }

    public function endpoint(string $endpoint): static
    {
        $this->endpoint = $endpoint;

        return $this;
    }

    /**
     * @param  array<int, Column>  $columns
     */
    public function columns(array $columns): static
    {
        $this->columns = array_map(
            fn (Column $column): array => $column->jsonSerialize(),
            array_values($this->renderableComponents($columns)),
        );

        return $this;
    }

    /**
     * @param  array<int, BaseFilter>  $filters
     */
    public function filters(array $filters): static
    {
        $this->filters = array_map(fn (BaseFilter $filter): FilterData => $filter->toData(), $filters);

        return $this;
    }

    public function layout(string $layout): static
    {
        $this->layout = $layout === 'table' ? null : $layout;

        return $this;
    }

    public function actionsLabel(string $label): static
    {
        $this->actionsLabel = $label;

        return $this;
    }

    public function emptyLabel(string $label): static
    {
        $this->emptyLabel = $label;

        return $this;
    }

    /**
     * @param  array<int, Action>  $actions
     */
    public function bulkActions(array $actions): static
    {
        $this->bulkActions = $actions;

        return $this;
    }

    public function striped(bool $striped): static
    {
        $this->striped = $striped ?: null;

        return $this;
    }

    public function resizableColumns(bool $resizable = true, bool $showIndicator = false): static
    {
        $this->resizableColumns = $resizable ?: null;
        $this->resizeIndicator = $resizable && $showIndicator;

        return $this;
    }

    public function result(TableResult $result, TableQuery $query): static
    {
        $this->result = $result->forQuery($query)->jsonSerialize();

        return $this;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 250)]
    protected function projectResult(array $data): array
    {
        if ($this->result === null) {
            return $data;
        }

        $props = is_array($data['props'] ?? null) ? $data['props'] : [];

        $data['props'] = [...$props, ...$this->result];

        return $data;
    }
}

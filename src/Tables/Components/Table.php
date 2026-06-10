<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Components;

use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\IsInteractive;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\ColumnData;
use Lattice\Lattice\Tables\TableDefinition;
use Lattice\Lattice\Tables\TableQuery;
use Lattice\Lattice\Tables\TableRegistry;
use Lattice\Lattice\Tables\TableResult;

class Table extends Component
{
    use IsInteractive;

    public ?string $endpoint = null;

    /**
     * @var array<int, ColumnData>
     */
    public array $columns = [];

    public ?string $layout = null;

    /**
     * @var array<int, Action>
     */
    public array $bulkActions = [];

    public ?bool $striped = null;

    public ?bool $lazy = null;

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
     */
    public static function use(string $table): static
    {
        /** @var static $registered */
        $registered = app(TableRegistry::class)->component($table);

        return clone $registered;
    }

    /**
     * @param  class-string<TableDefinition>  $table
     */
    public static function lazy(string $table): static
    {
        /** @var static $registered */
        $registered = app(TableRegistry::class)->lazyComponent($table);

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
        $this->columns = array_map(fn (Column $column): ColumnData => $column->toData(), $columns);

        return $this;
    }

    public function layout(string $layout): static
    {
        if ($layout === 'table') {
            return $this;
        }

        $this->layout = $layout;

        return $this;
    }

    /**
     * @param  array<int, Action>  $actions
     */
    public function bulkActions(array $actions): static
    {
        if ($actions === []) {
            return $this;
        }

        $this->bulkActions = $actions;

        return $this;
    }

    public function striped(bool $striped): static
    {
        if (! $striped) {
            return $this;
        }

        $this->striped = true;

        return $this;
    }

    public function result(TableResult $result, TableQuery $query): static
    {
        $this->result = $result->forQuery($query)->jsonSerialize();

        return $this;
    }

    protected function type(): string
    {
        return 'table';
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

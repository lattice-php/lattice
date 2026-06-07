<?php

namespace Bambamboole\Lattice\Components;

use Bambamboole\Lattice\Tables\Columns\Column;
use Bambamboole\Lattice\Tables\TableDefinition;
use Bambamboole\Lattice\Tables\TableQuery;
use Bambamboole\Lattice\Tables\TableRegistry;
use Bambamboole\Lattice\Tables\TableResult;

class Table extends InteractiveComponent
{
    public static function make(string $id): static
    {
        return (new static)->id($id);
    }

    /**
     * @param  class-string<TableDefinition>  $table
     */
    public static function use(string $table): static
    {
        $registered = app(TableRegistry::class)->component($table);

        return (new static)
            ->id($registered->id)
            ->props($registered->props);
    }

    /**
     * @param  class-string<TableDefinition>  $table
     */
    public static function lazy(string $table): static
    {
        $registered = app(TableRegistry::class)->lazyComponent($table);

        return (new static)
            ->id($registered->id)
            ->props($registered->props);
    }

    public function endpoint(string $endpoint): static
    {
        return $this->prop('endpoint', $endpoint);
    }

    /**
     * @param  array<int, Column>  $columns
     */
    public function columns(array $columns): static
    {
        return $this->prop('columns', array_map(
            fn (Column $column): array => $column->toArray(),
            $columns,
        ));
    }

    public function layout(string $layout): static
    {
        if ($layout === 'table') {
            return $this;
        }

        return $this->prop('layout', $layout);
    }

    public function result(TableResult $result, TableQuery $query): static
    {
        return $this->props($result->toArray($query));
    }

    protected function type(): string
    {
        return 'table';
    }
}

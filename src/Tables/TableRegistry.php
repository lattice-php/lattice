<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables;

use Bambamboole\Lattice\Attributes\Table;
use Bambamboole\Lattice\Components\Table\Table as TableComponent;
use Illuminate\Contracts\Container\Container;
use Illuminate\Http\Request;
use InvalidArgumentException;
use Spatie\Attributes\Attributes;

class TableRegistry
{
    /**
     * @var array<string, class-string<TableDefinition>>
     */
    private array $tables = [];

    public function __construct(private readonly Container $container) {}

    /**
     * @param  class-string<TableDefinition>|array<int, class-string<TableDefinition>>  $tables
     */
    public function register(string|array $tables): void
    {
        foreach ((array) $tables as $table) {
            $this->tables[$this->keyFor($table)] = $table;
        }
    }

    /**
     * @param  class-string<TableDefinition>  $table
     */
    public function component(string $table): TableComponent
    {
        $key = $this->registeredKeyFor($table);
        $definition = $this->make($table);
        $columns = $definition->columns();
        $query = TableQuery::empty($columns, $key, $definition->perPage());
        $result = $this->decorateResult($definition, $definition->query($query));

        return TableComponent::make($key)
            ->endpoint($this->endpointFor($key))
            ->columns($columns)
            ->layout($definition->layout())
            ->result($result, $query);
    }

    /**
     * @param  class-string<TableDefinition>  $table
     */
    public function lazyComponent(string $table): TableComponent
    {
        $key = $this->registeredKeyFor($table);
        $definition = $this->make($table);
        $columns = $definition->columns();
        $query = TableQuery::empty($columns, $key, $definition->perPage());
        $result = TableResult::make([])
            ->pagination(['mode' => $definition->paginationType()->value]);

        return TableComponent::make($key)
            ->endpoint($this->endpointFor($key))
            ->columns($columns)
            ->layout($definition->layout())
            ->result($result, $query)
            ->prop('lazy', true);
    }

    /**
     * @return array<string, mixed>
     */
    public function response(string $key, Request $request, ?TableDefinition $definition = null): array
    {
        $definition ??= $this->resolve($key);
        $columns = $definition->columns();
        $query = TableQuery::fromRequest($request, $columns, $key, $definition->perPage());

        return $this->decorateResult($definition, $definition->query($query))->toArray($query);
    }

    public function resolve(string $key): TableDefinition
    {
        if (! array_key_exists($key, $this->tables)) {
            throw new InvalidArgumentException("Lattice table [{$key}] is not registered.");
        }

        return $this->make($this->tables[$key]);
    }

    public function endpointFor(string $key): string
    {
        $endpoint = (string) config('lattice.tables.endpoint', 'lattice/tables/{table}');
        $path = str_replace('{table}', rawurlencode($key), ltrim($endpoint, '/'));

        return '/'.$path;
    }

    /**
     * @param  class-string<TableDefinition>  $table
     */
    private function registeredKeyFor(string $table): string
    {
        $key = $this->keyFor($table);

        if (($this->tables[$key] ?? null) !== $table) {
            throw new InvalidArgumentException("Lattice table [{$table}] is not registered.");
        }

        return $key;
    }

    /**
     * @param  class-string<TableDefinition>  $table
     */
    private function keyFor(string $table): string
    {
        if (! is_subclass_of($table, TableDefinition::class)) {
            throw new InvalidArgumentException("Lattice table [{$table}] must extend [".TableDefinition::class.'].');
        }

        $attribute = Attributes::get($table, Table::class);

        if (! $attribute instanceof Table) {
            throw new InvalidArgumentException("Lattice table [{$table}] is missing the [Table] attribute.");
        }

        return $attribute->key;
    }

    /**
     * @param  class-string<TableDefinition>  $table
     */
    private function make(string $table): TableDefinition
    {
        return $this->container->make($table);
    }

    private function decorateResult(TableDefinition $definition, TableResult $result): TableResult
    {
        return $result->rows(function (array $row, int $index) use ($definition): array {
            $actions = array_map(
                fn ($action): array => $action->toArray(),
                $definition->actions($row),
            );

            return array_filter([
                'key' => (string) ($row['id'] ?? $row['uuid'] ?? $row['key'] ?? $index),
                'actions' => $actions,
            ], fn (mixed $value, string $key): bool => $key === 'actions' ? $value !== [] : $actions !== [], ARRAY_FILTER_USE_BOTH);
        });
    }
}

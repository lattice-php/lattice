<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables;

use Bambamboole\Lattice\Actions\Components\Action as ActionComponent;
use Bambamboole\Lattice\Attributes\ComponentAttribute;
use Bambamboole\Lattice\Attributes\Table;
use Bambamboole\Lattice\Core\DefinitionRegistry;
use Bambamboole\Lattice\Tables\Components\Table as TableComponent;
use Illuminate\Http\Request;

/**
 * @extends DefinitionRegistry<TableDefinition>
 */
final class TableRegistry extends DefinitionRegistry
{
    /**
     * @param  class-string<TableDefinition>  $table
     */
    public function component(string $table): TableComponent
    {
        return $this->buildComponent(
            $table,
            fn (TableDefinition $definition, TableQuery $query): TableResult => $this->decorateResult($definition, $definition->query($query)),
        );
    }

    /**
     * @param  class-string<TableDefinition>  $table
     */
    public function lazyComponent(string $table): TableComponent
    {
        return $this->buildComponent(
            $table,
            fn (TableDefinition $definition, TableQuery $query): TableResult => TableResult::make([])
                ->pagination(['mode' => $definition->paginationType()->value]),
            lazy: true,
        );
    }

    /**
     * @param  class-string<TableDefinition>  $table
     * @param  callable(TableDefinition, TableQuery): TableResult  $result
     */
    private function buildComponent(string $table, callable $result, bool $lazy = false): TableComponent
    {
        $key = $this->registeredKeyFor($table);
        $definition = $this->make($table);
        $columns = $definition->columns();
        $query = TableQuery::empty($definition->perPage());

        $component = TableComponent::make($key)
            ->endpoint($this->endpointFor($key))
            ->columns($columns)
            ->layout($definition->layout())
            ->striped($definition->striped())
            ->bulkActions($this->bulkActions($definition, $key))
            ->result($result($definition, $query), $query);

        return $lazy ? $component->prop('lazy', true) : $component;
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

    /**
     * @return array<int, array<string, mixed>>
     */
    private function bulkActions(TableDefinition $definition, string $key): array
    {
        return array_map(
            fn (ActionComponent $action): array => $action->context(['table' => $key])->toArray(),
            $definition->bulkActions(),
        );
    }

    /**
     * @return class-string<TableDefinition>
     */
    protected function definitionClass(): string
    {
        return TableDefinition::class;
    }

    /**
     * @return class-string<ComponentAttribute>
     */
    public function attributeClass(): string
    {
        return Table::class;
    }

    protected function name(): string
    {
        return 'table';
    }

    public function group(): string
    {
        return 'tables';
    }

    private function decorateResult(TableDefinition $definition, TableResult $result): TableResult
    {
        return $result->decorateRows(function (array $row) use ($definition): array {
            $actions = array_map(
                fn ($action): array => $action->toArray(),
                $definition->actions($row),
            );

            if ($actions === []) {
                return $row;
            }

            return [...$row, 'actions' => $actions];
        });
    }
}

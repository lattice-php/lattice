<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables;

use Bambamboole\Lattice\Attributes\ComponentAttribute;
use Bambamboole\Lattice\Attributes\Table;
use Bambamboole\Lattice\Components\Core\Action as ActionComponent;
use Bambamboole\Lattice\Components\Table\Table as TableComponent;
use Bambamboole\Lattice\DefinitionRegistry;
use Illuminate\Http\Request;

/**
 * @extends DefinitionRegistry<TableDefinition>
 */
class TableRegistry extends DefinitionRegistry
{
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
            ->striped($definition->striped())
            ->bulkActions($this->bulkActions($definition, $key))
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
            ->striped($definition->striped())
            ->bulkActions($this->bulkActions($definition, $key))
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
    protected function attributeClass(): string
    {
        return Table::class;
    }

    protected function name(): string
    {
        return 'table';
    }

    protected function group(): string
    {
        return 'tables';
    }

    private function decorateResult(TableDefinition $definition, TableResult $result): TableResult
    {
        return $result->rows(function (array $row, int $index) use ($definition): array {
            $actions = array_map(
                fn ($action): array => $action->toArray(),
                $definition->actions($row),
            );

            if ($actions === []) {
                return [];
            }

            return [
                'key' => (string) ($row['id'] ?? $row['uuid'] ?? $row['key'] ?? $index),
                'actions' => $actions,
            ];
        });
    }
}

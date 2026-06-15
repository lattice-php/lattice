<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\DefinitionAttribute;
use Lattice\Lattice\Attributes\Table;
use Lattice\Lattice\Core\DefinitionRegistry;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\ColumnData;
use Lattice\Lattice\Tables\Columns\Filterable;
use Lattice\Lattice\Tables\Components\Table as TableComponent;
use Lattice\Lattice\Tables\Filters\BaseFilter;
use Lattice\Lattice\Tables\Filters\SelectFilter;
use Symfony\Component\HttpFoundation\Response;

/**
 * @extends DefinitionRegistry<TableDefinition>
 */
final class TableRegistry extends DefinitionRegistry
{
    private const ROW_IDENTITY_KEYS = ['id', 'uuid', 'key'];

    /**
     * @param  class-string<TableDefinition>  $table
     */
    public function component(string $table): TableComponent
    {
        return $this->buildComponent(
            $table,
            fn (TableDefinition $definition, TableQuery $query): TableResult => $definition->source()->query($query),
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
                ->pagination(TablePagination::pending($definition->paginationType())),
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
            ->filters($definition->filters())
            ->layout($definition->layout())
            ->striped($definition->striped())
            ->resizableColumns($definition->resizableColumns(), $definition->resizeIndicator())
            ->actionsLabel($definition->actionsLabel())
            ->emptyLabel($definition->emptyLabel())
            ->bulkActions($this->bulkActions($definition, $key))
            ->result($this->decorateResult($definition, $result($definition, $query), $columns), $query);

        if ($lazy) {
            $component->lazy = true;
        }

        return $component;
    }

    public function response(string $key, Request $request, ?TableDefinition $definition = null): TableResult
    {
        $definition ??= $this->resolve($key);
        $columns = $definition->columns();
        $query = TableQuery::fromRequest($request, $columns, $key, $definition->perPage(), $definition->filters());

        return $this->decorateResult($definition, $definition->source()->query($query), $columns)->forQuery($query);
    }

    /**
     * Resolve options for a searchable filter from the user's query (the `_search`
     * sub-action of the table endpoint).
     *
     * @return array{options: list<Option>}
     */
    public function searchFilterOptions(string $key, Request $request, ?TableDefinition $definition = null): array
    {
        $definition ??= $this->resolve($key);
        $filterKey = $request->string('_search')->toString();
        $query = $request->string('q')->toString();

        $filter = collect($definition->filters())
            ->first(fn (BaseFilter $filter): bool => $filter->key === $filterKey);

        if ($filter !== null) {
            abort_unless($filter instanceof SelectFilter && $filter->isSearchable(), Response::HTTP_UNPROCESSABLE_ENTITY);

            return ['options' => $filter->searchOptions($query)];
        }

        $column = collect($definition->columns())
            ->first(fn (Column $column): bool => $column->key() === $filterKey);

        abort_unless($column instanceof Filterable, Response::HTTP_NOT_FOUND);
        abort_unless($column->filterSearchable(), Response::HTTP_UNPROCESSABLE_ENTITY);

        return ['options' => $column->searchFilterOptions($query)];
    }

    /**
     * @return array<int, ActionComponent>
     */
    private function bulkActions(TableDefinition $definition, string $key): array
    {
        return array_map(
            fn (ActionComponent $action): ActionComponent => $action->context(['table' => $key]),
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
     * @return class-string<DefinitionAttribute>
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

    /**
     * @param  array<int, Column>  $columns
     */
    private function decorateResult(TableDefinition $definition, TableResult $result, array $columns): TableResult
    {
        $rowKeys = $this->rowKeys($columns);

        return $result->decorateRows(function (array $row) use ($definition, $rowKeys): array {
            $actions = $definition->actions($row);
            $projected = array_intersect_key($row, array_flip($rowKeys));

            unset($projected['actions']);

            if ($actions === []) {
                return $projected;
            }

            return [...$projected, 'actions' => $actions];
        });
    }

    /**
     * @param  array<int, Column>  $columns
     * @return array<int, string>
     */
    private function rowKeys(array $columns): array
    {
        $keys = self::ROW_IDENTITY_KEYS;

        foreach ($columns as $column) {
            array_push($keys, ...$this->columnKeys($column->toData()));
        }

        return array_values(array_unique($keys));
    }

    /**
     * @return array<int, string>
     */
    private function columnKeys(ColumnData $column): array
    {
        $keys = [$column->key];

        foreach ($column->columns ?? [] as $child) {
            array_push($keys, ...$this->columnKeys($child));
        }

        return $keys;
    }
}

<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Attributes\DefinitionAttribute;
use Lattice\Lattice\Core\DefinitionRegistry;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Forms\FormSchemaWalker;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\Filterable;
use Lattice\Lattice\Tables\Columns\StackColumn;
use Lattice\Lattice\Tables\Components\Table as TableComponent;
use Lattice\Lattice\Tables\Filters\Filter;
use Symfony\Component\HttpFoundation\Response;

/**
 * @extends DefinitionRegistry<TableDefinition>
 */
final class TableRegistry extends DefinitionRegistry
{
    private const array ROW_IDENTITY_KEYS = ['id', 'uuid', 'key'];

    /**
     * @param  class-string<TableDefinition>  $table
     * @param  array<string, mixed>  $context
     */
    public function component(string $table, array $context = []): TableComponent
    {
        return $this->buildComponent(
            $table,
            fn (TableDefinition $definition, TableQuery $query): TableResult => $definition->source()->query($query),
            $context,
        );
    }

    /**
     * @param  class-string<TableDefinition>  $table
     * @param  array<string, mixed>  $context
     */
    public function lazyComponent(string $table, array $context = []): TableComponent
    {
        return $this->buildComponent(
            $table,
            fn (TableDefinition $definition, TableQuery $query): TableResult => TableResult::make([])
                ->pagination(TablePagination::pending($definition->paginationType())),
            $context,
            lazy: true,
        );
    }

    /**
     * @param  class-string<TableDefinition>  $table
     * @param  callable(TableDefinition, TableQuery): TableResult  $result
     * @param  array<string, mixed>  $context
     */
    private function buildComponent(string $table, callable $result, array $context = [], bool $lazy = false): TableComponent
    {
        $key = $this->registeredKeyFor($table);
        $definition = $this->make($table)->withContext($context);
        $columns = $definition->columns();
        $query = TableQuery::empty($definition->perPage());

        $component = TableComponent::make($key)
            ->signedAs($key)
            ->context($context)
            ->endpoint($this->endpointFor($key))
            ->columns($columns)
            ->filters($definition->filters())
            ->layout($definition->layout())
            ->striped($definition->striped())
            ->resizableColumns($definition->resizableColumns(), $definition->resizeIndicator())
            ->actionsLabel($definition->actionsLabel())
            ->emptyLabel($definition->emptyLabel())
            ->bulkActions($this->bulkActions($definition, $key, $context))
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
     * sub-action of the table endpoint). Targets are namespaced — `filter:<key>.<field>`
     * addresses a dedicated filter's schema field, `column:<key>` a column filter — so
     * a filter key can never shadow a dot-keyed relation column.
     *
     * @return array{options: list<Option>}
     */
    public function searchFilterOptions(string $key, Request $request, ?TableDefinition $definition = null): array
    {
        $definition ??= $this->resolve($key);
        $searchKey = $request->string('_search')->toString();
        $query = $request->string('q')->toString();

        if (str_starts_with($searchKey, 'filter:')) {
            return ['options' => $this->searchFilterFieldOptions($definition, substr($searchKey, strlen('filter:')), $query, $request)];
        }

        if (str_starts_with($searchKey, 'column:')) {
            return ['options' => $this->searchColumnFilterOptions($definition, substr($searchKey, strlen('column:')), $query)];
        }

        abort(Response::HTTP_NOT_FOUND);
    }

    /**
     * @return list<Option>
     */
    private function searchFilterFieldOptions(TableDefinition $definition, string $target, string $query, Request $request): array
    {
        [$filterKey, $fieldKey] = str_contains($target, '.')
            ? explode('.', $target, 2)
            : [$target, 'value'];

        $filter = collect($definition->filters())
            ->first(fn (Filter $filter): bool => $filter->key() === $filterKey);

        abort_if($filter === null, Response::HTTP_NOT_FOUND);

        $instance = app(FormSchemaWalker::class)->find($filter->schema(), $fieldKey, FormData::fromRequest($request));

        abort_if($instance === null, Response::HTTP_NOT_FOUND);

        $field = $instance->field;

        abort_unless($field instanceof Select && $field->isSearchable(), Response::HTTP_UNPROCESSABLE_ENTITY);

        return $field->resolveSearch($query, $instance->scope, $request);
    }

    /**
     * @return list<Option>
     */
    private function searchColumnFilterOptions(TableDefinition $definition, string $columnKey, string $query): array
    {
        $column = collect($definition->columns())
            ->first(fn (Column $column): bool => $column->key() === $columnKey);

        abort_unless($column instanceof Filterable, Response::HTTP_NOT_FOUND);
        abort_unless($column->filterSearchable(), Response::HTTP_UNPROCESSABLE_ENTITY);

        return $column->searchFilterOptions($query);
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array<int, ActionComponent>
     */
    private function bulkActions(TableDefinition $definition, string $key, array $context): array
    {
        return array_map(
            fn (ActionComponent $action): ActionComponent => $action->context([...$context, 'table' => $key]),
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
        return AsTable::class;
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
            if (! $column->shouldRender()) {
                continue;
            }

            array_push($keys, ...$this->columnKeys($column));
        }

        return array_values(array_unique($keys));
    }

    /**
     * @return array<int, string>
     */
    private function columnKeys(Column $column): array
    {
        if ($column instanceof StackColumn) {
            $keys = [];

            foreach ($column->children() as $child) {
                if (! $child->shouldRender()) {
                    continue;
                }

                array_push($keys, ...$child->boundRowKeys());
            }

            return array_values(array_unique($keys));
        }

        return [$column->key()];
    }
}

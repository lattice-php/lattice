<?php
declare(strict_types=1);

namespace Lattice\Table;

use Illuminate\Http\Request;
use Lattice\Core\Attributes\DefinitionAttribute;
use Lattice\Core\Contracts\InteractiveComponent;
use Lattice\Core\DefinitionRegistry;
use Lattice\Core\Http\SubRequest;
use Lattice\Core\Option;
use Lattice\Form\Components\Select;
use Lattice\Form\FormData;
use Lattice\Form\FormSchemaWalker;
use Lattice\Table\Attributes\AsTable;
use Lattice\Table\Columns\Column;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Components\Table as TableComponent;
use Lattice\Table\Contracts\Filterable;
use Lattice\Table\Contracts\Searchable;
use Lattice\Table\Filters\Filter;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Concerns\FiltersRenderableComponents;
use Symfony\Component\HttpFoundation\Response;

/**
 * @extends DefinitionRegistry<TableDefinition>
 */
final class TableRegistry extends DefinitionRegistry
{
    use FiltersRenderableComponents;

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
        return $this->gatedComponent(
            $table,
            fn (string $key): TableComponent => TableComponent::make($key),
            function (TableDefinition $definition, TableComponent $component, string $key) use ($result, $context, $lazy): TableComponent {
                $columns = $definition->columns();
                $query = TableQuery::empty($definition->perPage());

                $component
                    ->endpoint($this->endpointFor($key))
                    ->columns($columns)
                    ->filters($definition->filters())
                    ->perPageOptions($definition->perPageOptions())
                    ->searchable($this->hasSearchableColumns($columns))
                    ->layout($definition->layout())
                    ->striped($definition->striped())
                    ->resizableColumns($definition->resizableColumns(), $definition->resizeIndicator())
                    ->pinnableColumns($definition->pinnableColumns())
                    ->actionsLabel($definition->actionsLabel())
                    ->emptyLabel($definition->emptyLabel())
                    ->bulkActions($this->bulkActions($definition, $key, $context))
                    ->toolbar($this->toolbarComponents($definition, $key, $context))
                    ->result($this->decorateResult($definition, $result($definition, $query), $columns), $query);

                $component->lazy = $lazy;

                return $component;
            },
            $context,
        );
    }

    public function response(string $key, Request $request, ?TableDefinition $definition = null): TableResult
    {
        $definition ??= $this->resolve($key);
        $columns = $definition->columns();
        $query = TableQuery::fromRequest($request, $columns, $key, $definition->perPage(), $definition->filters(), $definition->perPageOptions());

        return $this->decorateResult($definition, $definition->source()->query($query), $columns)->forQuery($query);
    }

    /**
     * Resolve options for a searchable filter from the user's query (the search
     * sub-request of the table endpoint). Targets are namespaced — `filter:<key>.<field>`
     * addresses a dedicated filter's schema field, `column:<key>` a column filter — so
     * a filter key can never shadow a dot-keyed relation column.
     *
     * @return array{options: list<Option>}
     */
    public function searchFilterOptions(string $key, Request $request, SubRequest $sub, ?TableDefinition $definition = null): array
    {
        $definition ??= $this->resolve($key);

        if (str_starts_with($sub->target, 'filter:')) {
            return ['options' => $this->searchFilterFieldOptions($definition, substr($sub->target, strlen('filter:')), $sub->query, $request)];
        }

        if (str_starts_with($sub->target, 'column:')) {
            return ['options' => $this->searchColumnFilterOptions($definition, substr($sub->target, strlen('column:')), $sub->query)];
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

        $filter = array_find($definition->filters(), fn (Filter $filter): bool => $filter->key() === $filterKey);

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
        $column = array_find($definition->columns(), fn (Column $column): bool => $column->key() === $columnKey);

        abort_unless($column instanceof Filterable, Response::HTTP_NOT_FOUND);
        abort_unless($column->filterSearchable(), Response::HTTP_UNPROCESSABLE_ENTITY);

        return $column->searchFilterOptions($query);
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array<int, Component>
     */
    private function bulkActions(TableDefinition $definition, string $key, array $context): array
    {
        return array_map(
            fn (Component&InteractiveComponent $action): Component => $action->mergeContext($context, ['table' => $key]),
            $this->renderableComponents($definition->bulkActions()),
        );
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array<int, Component>
     */
    private function toolbarComponents(TableDefinition $definition, string $key, array $context): array
    {
        return array_map(
            fn (Component $component): Component => $component instanceof InteractiveComponent
                ? $component->mergeContext($context, ['table' => $key])
                : $component,
            $this->renderableComponents($definition->toolbar()),
        );
    }

    /**
     * @param  array<int, Column>  $columns
     */
    private function hasSearchableColumns(array $columns): bool
    {
        return array_any(
            $columns,
            static fn (Column $column): bool => $column instanceof Searchable && $column->isSearchable(),
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
        $popoverColumns = $this->textColumnsWhere($columns, static fn (TextColumn $column): bool => $column->hasPopover());
        $linkColumns = $this->textColumnsWhere($columns, static fn (TextColumn $column): bool => $column->hasLinkResolver());

        return $result->decorateRows(function (array $row) use ($definition, $rowKeys, $popoverColumns, $linkColumns): array {
            $actions = $this->renderableComponents($definition->actions($row));
            $detail = $this->renderableComponents(array_filter([$definition->rowDetail($row)]));
            $popovers = $this->popovers($popoverColumns, $row);
            $links = $this->resolvedLinks($linkColumns, $row);
            $projected = array_intersect_key($row, array_flip($rowKeys));

            unset($projected['actions'], $projected['detail'], $projected['popovers'], $projected['links']);

            if ($detail !== []) {
                $projected['detail'] = $detail[0];
            }

            if ($actions !== []) {
                $projected['actions'] = $actions;
            }

            if ($popovers !== []) {
                $projected['popovers'] = $popovers;
            }

            if ($links !== []) {
                $projected['links'] = $links;
            }

            return $projected;
        });
    }

    /**
     * @param  array<int, Column>  $columns
     * @param  callable(TextColumn): bool  $matches
     * @return array<int, TextColumn>
     */
    private function textColumnsWhere(array $columns, callable $matches): array
    {
        return array_values(array_filter(
            $columns,
            static fn (Column $column): bool => $column->shouldRender() && $column instanceof TextColumn && $matches($column),
        ));
    }

    /**
     * @param  array<int, TextColumn>  $columns
     * @param  array<string, mixed>  $row
     * @return array<string, Component>
     */
    private function popovers(array $columns, array $row): array
    {
        $popovers = [];

        foreach ($columns as $column) {
            $component = $column->popoverComponent($row);

            if ($component !== null && $component->shouldRender()) {
                $popovers[$column->key()] = $component;
            }
        }

        return $popovers;
    }

    /**
     * Every closure-driven link column gets an entry for every row — even a
     * null one — so the client can tell "this column resolves per row and
     * this row has none" apart from "this column has no resolver at all"
     * (the string-template form, where a null href falls back to the value).
     *
     * @param  array<int, TextColumn>  $columns
     * @param  array<string, mixed>  $row
     * @return array<string, string|null>
     */
    private function resolvedLinks(array $columns, array $row): array
    {
        $links = [];

        foreach ($columns as $column) {
            $links[$column->key()] = $column->resolvedLink($row);
        }

        return $links;
    }

    /**
     * The identity keys plus every rendering column's bound row keys. A
     * visible(false) column stays authoritative for its own key: hidden means
     * gone from the row payload even when a rendering sibling binds the key
     * (e.g. a badge colour reference) — unless the key is also a rendering
     * column's own key or an identity key.
     *
     * @param  array<int, Column>  $columns
     * @return array<int, string>
     */
    private function rowKeys(array $columns): array
    {
        $keys = self::ROW_IDENTITY_KEYS;
        $rendered = [];
        $suppressed = [];

        foreach ($columns as $column) {
            if ($column->shouldRender()) {
                $rendered[] = $column->key();
                array_push($keys, ...$column->boundRowKeys());
            } else {
                $suppressed[] = $column->key();
            }
        }

        $suppressed = array_diff($suppressed, self::ROW_IDENTITY_KEYS, $rendered);

        return array_values(array_unique(array_diff($keys, $suppressed)));
    }
}

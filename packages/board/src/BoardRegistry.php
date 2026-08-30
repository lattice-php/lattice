<?php
declare(strict_types=1);

namespace Lattice\Board;

use Illuminate\Http\Request;
use Lattice\Board\Components\Board;
use Lattice\Core\Contracts\InteractiveComponent;
use Lattice\Core\DefinitionRegistry;
use Lattice\Core\Http\SubRequest;
use Lattice\Core\Option;
use Lattice\Table\Filters\FilterFieldOptionsResolver;
use Lattice\Table\Support\QueryUrlScope;
use Lattice\Table\TableRegistry;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Concerns\FiltersRenderableComponents;
use Symfony\Component\HttpFoundation\Response;

/**
 * @extends DefinitionRegistry<BoardDefinition>
 */
final class BoardRegistry extends DefinitionRegistry
{
    use FiltersRenderableComponents;

    /**
     * @param  class-string<BoardDefinition>  $board
     * @param  array<string, mixed>  $context
     */
    public function component(string $board, array $context = []): Board
    {
        return $this->gatedComponent(
            $board,
            fn (string $key): Board => Board::make($key),
            function (BoardDefinition $definition, Board $component, string $key): Board {
                $perColumn = $definition->perColumn();
                $query = $definition->syncsQueryToUrl()
                    ? BoardQuery::forPage(
                        QueryUrlScope::request($this->container->make(Request::class), $definition->urlQueryKey()),
                        $key,
                        $perColumn,
                        $definition->filters(),
                    )
                    : BoardQuery::empty($perColumn);

                return $component
                    ->id($key)
                    ->endpoint($this->endpointFor($key))
                    ->columns(array_map(
                        fn (BoardColumn $column): BoardColumnData => $column->data(),
                        $definition->columns(),
                    ))
                    ->filters($definition->filters())
                    ->searchable($definition->searchable() !== [])
                    ->perColumn($perColumn)
                    ->schema($definition->card())
                    ->syncQuery($definition->syncsQueryToUrl())
                    ->queryKey($definition->urlQueryKey())
                    ->query(['q' => $query->search, 'tf' => $query->tableFilters])
                    ->result($this->decorateResult($definition, $key, $definition->source()->query($query)->withIndicators($query->tableFilterIndicators)));
            },
            $context,
        );
    }

    public function response(string $key, Request $request, ?BoardDefinition $definition = null): BoardResult
    {
        $definition ??= $this->resolve($key);
        $query = BoardQuery::fromRequest($request, $key, $definition->perColumn(), $definition->filters());

        $this->guardColumn($definition, $query);

        return $this->decorateResult($definition, $key, $definition->source()->query($query)->withIndicators($query->tableFilterIndicators));
    }

    /**
     * Resolve options for a searchable filter from the user's query (the
     * search sub-request of the board endpoint). Mirrors
     * {@see TableRegistry::searchFilterOptions()} — a board
     * only has dedicated filters, so only the `filter:<key>.<field>` target
     * is supported.
     *
     * @return array{options: list<Option>}
     */
    public function searchFilterOptions(string $key, Request $request, SubRequest $sub, ?BoardDefinition $definition = null): array
    {
        $definition ??= $this->resolve($key);

        if (str_starts_with($sub->target, 'filter:')) {
            return ['options' => FilterFieldOptionsResolver::resolve($definition->filters(), substr($sub->target, strlen('filter:')), $sub->query, $request)];
        }

        abort(Response::HTTP_NOT_FOUND);
    }

    private function guardColumn(BoardDefinition $definition, BoardQuery $query): void
    {
        if ($query->column === null) {
            return;
        }

        $known = array_map(fn (BoardColumn $column): string => $column->key(), $definition->columns());

        abort_unless(in_array($query->column, $known, true), 422);
    }

    private function decorateResult(BoardDefinition $definition, string $key, BoardResult $result): BoardResult
    {
        return $result->decorateCards(function (array $card) use ($definition, $key): array {
            $actions = $this->renderableComponents($definition->cardActions($card));
            $url = $definition->cardUrl($card);
            $data = $definition->cardData($card);

            unset($data['actions'], $data['cardUrl']);

            if ($actions !== []) {
                $data['actions'] = array_map(
                    fn (Component $action): Component => $action instanceof InteractiveComponent
                        ? $action->mergeContext([], ['board' => $key])
                        : $action,
                    $actions,
                );
            }

            if ($url !== null) {
                $data['cardUrl'] = $url;
            }

            return $data;
        });
    }

    protected function definitionClass(): string
    {
        return BoardDefinition::class;
    }

    public function attributeClass(): string
    {
        return AsBoard::class;
    }

    protected function name(): string
    {
        return 'board';
    }

    public function group(): string
    {
        return 'boards';
    }
}

<?php
declare(strict_types=1);

namespace Lattice\Board;

use Illuminate\Http\Request;
use Lattice\Board\Components\Board;
use Lattice\Core\Contracts\InteractiveComponent;
use Lattice\Core\DefinitionRegistry;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Concerns\FiltersRenderableComponents;

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

                return $component
                    ->id($key)
                    ->endpoint($this->endpointFor($key))
                    ->columns(array_map(
                        fn (BoardColumn $column): BoardColumnData => $column->data(),
                        $definition->columns(),
                    ))
                    ->perColumn($perColumn)
                    ->schema($definition->card())
                    ->result($this->decorateResult($definition, $key, $definition->source()->query(BoardQuery::empty($perColumn))));
            },
            $context,
        );
    }

    public function response(string $key, Request $request, ?BoardDefinition $definition = null): BoardResult
    {
        $definition ??= $this->resolve($key);
        $query = BoardQuery::fromRequest($request, $key, $definition->perColumn());

        $this->guardColumn($definition, $query);

        return $this->decorateResult($definition, $key, $definition->source()->query($query));
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

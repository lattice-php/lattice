<?php
declare(strict_types=1);

namespace Lattice\Board;

use Illuminate\Http\Request;
use Lattice\Board\Components\Board;
use Lattice\Core\DefinitionRegistry;

/**
 * @extends DefinitionRegistry<BoardDefinition>
 */
final class BoardRegistry extends DefinitionRegistry
{
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
                    ->result($this->decorateResult($definition, $definition->source()->query(BoardQuery::empty($perColumn))));
            },
            $context,
        );
    }

    public function response(string $key, Request $request, ?BoardDefinition $definition = null): BoardResult
    {
        $definition ??= $this->resolve($key);
        $query = BoardQuery::fromRequest($request, $key, $definition->perColumn());

        $this->guardColumn($definition, $query);

        return $this->decorateResult($definition, $definition->source()->query($query));
    }

    private function guardColumn(BoardDefinition $definition, BoardQuery $query): void
    {
        if ($query->column === null) {
            return;
        }

        $known = array_map(fn (BoardColumn $column): string => $column->key(), $definition->columns());

        abort_unless(in_array($query->column, $known, true), 422);
    }

    private function decorateResult(BoardDefinition $definition, BoardResult $result): BoardResult
    {
        return $result->decorateCards($definition->cardData(...));
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

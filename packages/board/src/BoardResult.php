<?php
declare(strict_types=1);

namespace Lattice\Board;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
final readonly class BoardResult
{
    /**
     * @param  list<BoardColumnCards>  $columns
     */
    public function __construct(
        public array $columns,
    ) {}

    /**
     * @param  list<BoardColumnCards>  $columns
     */
    public static function make(array $columns): self
    {
        return new self($columns);
    }

    /**
     * Maps each card through the callback, letting callers attach per-card
     * data (such as an override projection) to the card itself.
     *
     * @param  callable(array<string, mixed>): array<string, mixed>  $callback
     */
    public function decorateCards(callable $callback): self
    {
        return new self(array_map(
            fn (BoardColumnCards $column): BoardColumnCards => $column->withCards(
                array_map($callback, $column->cards),
            ),
            $this->columns,
        ));
    }
}

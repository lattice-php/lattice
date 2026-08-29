<?php
declare(strict_types=1);

namespace Lattice\Board;

use Lattice\Core\Attributes\TypeScript;
use Lattice\Table\Filters\FilterIndicator;

#[TypeScript]
final readonly class BoardResult
{
    /**
     * @param  list<BoardColumnCards>  $columns
     * @param  list<FilterIndicator>  $indicators
     */
    public function __construct(
        public array $columns,
        public array $indicators = [],
    ) {}

    /**
     * @param  list<BoardColumnCards>  $columns
     */
    public static function make(array $columns): self
    {
        return new self($columns);
    }

    /**
     * @param  list<FilterIndicator>  $indicators
     */
    public function withIndicators(array $indicators): self
    {
        return new self($this->columns, $indicators);
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
        ), $this->indicators);
    }
}

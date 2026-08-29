<?php
declare(strict_types=1);

namespace Lattice\Board;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
final readonly class BoardColumnCards
{
    /**
     * @param  list<array<string, mixed>>  $cards
     */
    public function __construct(
        public string $key,
        public array $cards,
        public int $total,
        public bool $hasMore,
        public int $offset,
    ) {}

    /**
     * @param  list<array<string, mixed>>  $cards
     */
    public function withCards(array $cards): self
    {
        return new self($this->key, $cards, $this->total, $this->hasMore, $this->offset);
    }
}

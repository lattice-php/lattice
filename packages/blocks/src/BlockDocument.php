<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Generator;
use Lattice\Core\Attributes\TypeScript;

/**
 * The stored block tree of one page: the ordered root blocks, each carrying
 * its own slot children, under a format version for forward compatibility.
 */
#[TypeScript]
final readonly class BlockDocument
{
    /**
     * @param  list<BlockNode>  $blocks
     */
    public function __construct(
        public array $blocks = [],
        public int $version = 1,
    ) {}

    public static function empty(): self
    {
        return new self;
    }

    /**
     * @param  array<string, mixed>|string|null  $document
     */
    public static function fromArray(array|string|null $document): self
    {
        if (is_string($document)) {
            $decoded = json_decode($document, true);
            $document = is_array($decoded) ? $decoded : [];
        }

        $blocks = is_array($document['blocks'] ?? null) ? $document['blocks'] : [];

        return new self(array_values(array_map(
            BlockNode::fromArray(...),
            array_filter($blocks, is_array(...)),
        )));
    }

    /**
     * @return Generator<int, BlockNode>
     */
    public function walk(): Generator
    {
        foreach ($this->blocks as $block) {
            yield from $block->walk();
        }
    }

    public function find(string $id): ?BlockNode
    {
        foreach ($this->walk() as $block) {
            if ($block->id === $id) {
                return $block;
            }
        }

        return null;
    }

    public function isEmpty(): bool
    {
        return $this->blocks === [];
    }
}

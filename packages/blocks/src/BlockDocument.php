<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Generator;
use Lattice\Core\Attributes\TypeScript;

/**
 * The stored block tree of one page: a version for migrations and the ordered
 * root blocks, each carrying its own slot children.
 */
#[TypeScript]
final readonly class BlockDocument
{
    public const int VERSION = 1;

    /**
     * @param  list<BlockNode>  $blocks
     */
    public function __construct(
        public array $blocks = [],
        public int $version = self::VERSION,
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
        $version = $document['version'] ?? self::VERSION;

        return new self(
            blocks: array_values(array_map(
                BlockNode::fromArray(...),
                array_filter($blocks, is_array(...)),
            )),
            version: is_int($version) ? $version : self::VERSION,
        );
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

<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Generator;
use Illuminate\Support\Str;
use Lattice\Core\Attributes\TypeScript;

/**
 * One stored block: a stable id, its type key, validated-or-not data, generic
 * style, and the child blocks per named slot.
 */
#[TypeScript]
final readonly class BlockNode
{
    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, list<BlockNode>>  $slots
     */
    public function __construct(
        public string $id,
        public string $type,
        public array $data = [],
        public BlockStyle $style = new BlockStyle,
        public array $slots = [],
    ) {}

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, list<BlockNode>>  $slots
     */
    public static function make(string $type, array $data = [], array $slots = [], ?string $id = null): self
    {
        return new self($id ?? self::newId(), $type, $data, BlockStyle::empty(), $slots);
    }

    public static function newId(): string
    {
        return 'b_'.Str::lower(Str::random(8));
    }

    /**
     * @param  array<string, mixed>  $node
     */
    public static function fromArray(array $node): self
    {
        $slots = [];

        foreach (is_array($node['slots'] ?? null) ? $node['slots'] : [] as $name => $children) {
            if (! is_string($name) || ! is_array($children)) {
                continue;
            }

            $slots[$name] = array_values(array_map(
                self::fromArray(...),
                array_filter($children, is_array(...)),
            ));
        }

        $id = $node['id'] ?? null;
        $type = $node['type'] ?? null;

        return new self(
            id: is_string($id) && $id !== '' ? $id : self::newId(),
            type: is_string($type) ? $type : 'unknown',
            data: is_array($node['data'] ?? null) ? $node['data'] : [],
            style: BlockStyle::fromArray(is_array($node['style'] ?? null) ? $node['style'] : []),
            slots: $slots,
        );
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function withData(array $data): self
    {
        return new self($this->id, $this->type, $data, $this->style, $this->slots);
    }

    /**
     * @param  array<string, list<BlockNode>>  $slots
     */
    public function withSlots(array $slots): self
    {
        return new self($this->id, $this->type, $this->data, $this->style, $slots);
    }

    /**
     * Depth-first: this node, then every descendant.
     *
     * @return Generator<int, BlockNode>
     */
    public function walk(): Generator
    {
        yield $this;

        foreach ($this->slots as $children) {
            foreach ($children as $child) {
                yield from $child->walk();
            }
        }
    }
}

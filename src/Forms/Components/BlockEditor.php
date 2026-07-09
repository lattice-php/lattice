<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Blocks\BlockDefinition;
use Lattice\Lattice\Blocks\BlockRegistry;
use Lattice\Lattice\Blocks\BlockRenderer;
use Lattice\Lattice\Core\Components\IsInteractive;
use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Enums\FieldType;

#[AsField(FieldType::BlockEditor)]
class BlockEditor extends Builder
{
    use IsInteractive;

    public ?string $endpoint = null;

    /**
     * @param  array<int, class-string<BlockDefinition>|Block>  $blocks
     */
    #[\Override]
    public function blocks(array $blocks): static
    {
        $registry = app(BlockRegistry::class);

        $this->blocks = array_map(
            fn (string|Block $block): Block => $block instanceof Block
                ? $block
                : Block::make($registry->keyFor($block))->schema(app($block)->attributes()),
            $blocks,
        );

        $this->id ??= $this->name;
        $this->endpoint ??= '/'.ltrim((string) config('lattice.blocks.endpoint', 'lattice/blocks/render'), '/');
        $this->signedAs('block-editor');
        $this->context(['allowedBlocks' => array_map(fn (Block $block): string => $block->type, $this->blocks)]);

        return $this;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 350)]
    protected function serialiseRenderedRows(array $data): array
    {
        $renderer = app(BlockRenderer::class);

        $rows = is_array($this->value) ? array_values($this->value) : [];

        $rendered = array_map(
            fn (mixed $row): array => $renderer->render([is_array($row) ? $row : []])->renderable(),
            $rows,
        );

        return [...$data, 'rendered' => $rendered];
    }
}

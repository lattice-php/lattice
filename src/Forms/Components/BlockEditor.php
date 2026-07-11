<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Blocks\BlockDefinition;
use Lattice\Lattice\Blocks\BlockRegistry;
use Lattice\Lattice\Blocks\BlockRenderer;
use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Enums\FieldType;
use Lattice\Lattice\Ui\Components\IsInteractive;

#[AsField(FieldType::BlockEditor)]
class BlockEditor extends TypedRowsField
{
    use IsInteractive;

    public ?string $endpoint = null;

    /**
     * @param  array<int, class-string<BlockDefinition>>  $blocks
     */
    public function blocks(array $blocks): static
    {
        $registry = app(BlockRegistry::class);

        $this->templates(array_map(
            function (string $block) use ($registry): RowTemplate {
                $definition = app($block);

                return RowTemplate::make($registry->keyFor($block))
                    ->schema($definition->attributes())
                    ->slots($definition->slots());
            },
            $blocks,
        ));

        $this->id ??= $this->name;
        $this->endpoint ??= '/'.ltrim((string) config('lattice.blocks.endpoint', 'lattice/blocks/render'), '/');
        $this->signedAs('block-editor');
        $this->context(['allowedBlocks' => array_map(
            static fn (RowTemplate $template): string => $template->type,
            $this->templates,
        )]);

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

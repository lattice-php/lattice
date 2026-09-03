<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Lattice\Blocks\Attributes\AsBlockEditor;
use Lattice\Blocks\Components\BlockEditor;
use Lattice\Core\DefinitionRegistry;

/**
 * @extends DefinitionRegistry<BlockEditorDefinition>
 */
final class BlockEditorRegistry extends DefinitionRegistry
{
    /**
     * @param  class-string<BlockEditorDefinition>  $editor
     * @param  array<string, mixed>  $context
     */
    public function component(string $editor, array $context = []): BlockEditor
    {
        return $this->gatedComponent(
            $editor,
            fn (string $key): BlockEditor => BlockEditor::make($key),
            function (BlockEditorDefinition $definition, BlockEditor $component, string $key): BlockEditor {
                $document = $definition->load();
                $renderer = $this->container->make(BlockRenderer::class);

                return $component
                    ->id($key)
                    ->endpoint($this->endpointFor($key))
                    ->document($document)
                    ->revision($definition->revision())
                    ->types($this->typesFor($definition))
                    ->patterns($this->patternsFor($definition))
                    ->rendered($renderer->renderShallowAll($document))
                    ->previewUrl($definition->previewUrl())
                    ->title($definition->title());
            },
            $context,
        );
    }

    /**
     * @return list<string>
     */
    public function allowedTypes(BlockEditorDefinition $definition): array
    {
        $blocks = $this->container->make(BlockRegistry::class);
        $classes = $definition->blocks();

        return $classes === [] ? $blocks->keys() : array_map($blocks->keyOf(...), $classes);
    }

    /**
     * The editor's patterns, keeping only those whose root blocks the editor
     * offers, so a pattern never inserts a block the library would refuse.
     *
     * @return list<BlockPatternData>
     */
    public function patternsFor(BlockEditorDefinition $definition): array
    {
        $allowed = $this->allowedTypes($definition);
        $patterns = [];

        foreach ($definition->patterns() as $pattern) {
            $data = $pattern->data();
            $types = array_map(static fn (BlockNode $node): string => $node->type, $data->blocks);

            if (array_diff($types, $allowed) === []) {
                $patterns[] = $data;
            }
        }

        return $patterns;
    }

    /**
     * @return list<BlockTypeData>
     */
    public function typesFor(BlockEditorDefinition $definition): array
    {
        $blocks = $this->container->make(BlockRegistry::class);

        return array_map($blocks->typeData(...), $this->allowedTypes($definition));
    }

    protected function definitionClass(): string
    {
        return BlockEditorDefinition::class;
    }

    public function attributeClass(): string
    {
        return AsBlockEditor::class;
    }

    protected function name(): string
    {
        return 'editor';
    }

    public function group(): string
    {
        return 'block-editors';
    }
}

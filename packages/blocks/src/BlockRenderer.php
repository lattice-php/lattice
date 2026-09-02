<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Lattice\Blocks\Components\BlockFrame;
use Lattice\Blocks\Components\BlockView;
use Lattice\Blocks\Components\UnknownBlock;
use Lattice\Ui\Components\Component;

/**
 * Turns stored blocks into Lattice components. The view renders the whole tree;
 * the editor renders each block shallowly (slot outlets left empty) and nests
 * children itself, so one block can re-render without touching its siblings.
 */
final readonly class BlockRenderer
{
    public function __construct(private BlockRegistry $blocks) {}

    public function render(BlockDocument $document, ?BlockView $view = null): BlockView
    {
        return ($view ?? BlockView::make())->schema(array_map($this->renderDeep(...), $document->blocks));
    }

    public function renderDeep(BlockNode $node): BlockFrame
    {
        return $this->frame($node, fn (BlockDefinition $definition, array $slots): array => $this->renderChildren($node, $slots));
    }

    public function renderShallow(BlockNode $node): BlockFrame
    {
        return $this->frame($node, static fn (): array => []);
    }

    /**
     * @return array<string, BlockFrame>
     */
    public function renderShallowAll(BlockDocument $document): array
    {
        $rendered = [];

        foreach ($document->walk() as $node) {
            $rendered[$node->id] = $this->renderShallow($node);
        }

        return $rendered;
    }

    /**
     * @param  callable(BlockDefinition, array<string, SlotData>): array<string, list<Component>>  $children
     */
    private function frame(BlockNode $node, callable $children): BlockFrame
    {
        $frame = BlockFrame::make($node->id)->block($node->id, $node->type)->style($node->style);
        $definition = $this->blocks->find($node->type);

        if (! $definition instanceof BlockDefinition) {
            return $frame->supports(BlockSupports::none())->schema([UnknownBlock::make($node->type)]);
        }

        $slots = $this->blocks->slotsFor($definition, $node->data);
        $data = $this->blocks->castData($definition, $node->data);

        return $frame
            ->supports($definition->supports())
            ->schema([$definition->render($data, new BlockSlots($node, $slots, $children($definition, $slots)))]);
    }

    /**
     * @param  array<string, SlotData>  $slots
     * @return array<string, list<Component>>
     */
    private function renderChildren(BlockNode $node, array $slots): array
    {
        $rendered = [];

        foreach (array_keys($slots) as $name) {
            $rendered[$name] = array_map($this->renderDeep(...), $node->slots[$name] ?? []);
        }

        return $rendered;
    }
}

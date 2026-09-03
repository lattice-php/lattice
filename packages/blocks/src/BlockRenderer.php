<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Lattice\Blocks\Components\BlockFrame;
use Lattice\Blocks\Components\BlockView;
use Lattice\Blocks\Components\UnknownBlock;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\ContainerComponent;

/**
 * Turns stored blocks into Lattice components. The view renders the whole tree
 * and drops blocks that render nothing, the way the HTML output does; the
 * editor renders each block shallowly (slot outlets left empty) and nests
 * children itself, so one block can re-render without touching its siblings.
 */
final readonly class BlockRenderer
{
    public function __construct(
        private BlockRegistry $blocks,
        private StyleClassMap $styles,
    ) {}

    public function render(BlockDocument $document, ?BlockView $view = null): BlockView
    {
        return ($view ?? BlockView::make())->schema($this->renderAll($document->blocks));
    }

    public function renderDeep(BlockNode $node): ?BlockFrame
    {
        $frame = $this->frame($node, fn (array $slots): array => $this->renderChildren($node, $slots), editing: false);

        return $this->isBlank($frame) ? null : $frame;
    }

    public function renderShallow(BlockNode $node): BlockFrame
    {
        return $this->frame($node, static fn (): array => [], editing: true);
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
     * @param  list<BlockNode>  $nodes
     * @return list<BlockFrame>
     */
    private function renderAll(array $nodes): array
    {
        return array_values(array_filter(array_map($this->renderDeep(...), $nodes)));
    }

    /**
     * @param  callable(array<string, SlotData>): array<string, list<Component>>  $children
     */
    private function frame(BlockNode $node, callable $children, bool $editing): BlockFrame
    {
        $frame = BlockFrame::make($node->id)
            ->block($node->id, $node->type)
            ->style($node->style)
            ->classes($this->styles->classesFor($node->style));
        $definition = $this->blocks->find($node->type);

        if (! $definition instanceof BlockDefinition) {
            return $frame->supports(BlockSupports::none())->schema([UnknownBlock::make($node->type)]);
        }

        $slots = $this->blocks->slotsFor($definition, $node->data);
        $data = $this->blocks->castData($definition, $node->data, $editing);

        return $frame
            ->supports($definition->supports())
            ->schema([$definition->render($data, new BlockSlots($node, $slots, $children($slots)))]);
    }

    /**
     * @param  array<string, SlotData>  $slots
     * @return array<string, list<Component>>
     */
    private function renderChildren(BlockNode $node, array $slots): array
    {
        $rendered = [];

        foreach (array_keys($slots) as $name) {
            $rendered[$name] = $this->renderAll($node->slots[$name] ?? []);
        }

        return $rendered;
    }

    /**
     * A block whose render is a container with nothing inside, like an image
     * block without an image.
     */
    private function isBlank(BlockFrame $frame): bool
    {
        $content = $frame->descendants()[0] ?? null;

        return $content instanceof ContainerComponent && $content->descendants() === [];
    }
}

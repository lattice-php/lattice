<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Illuminate\Contracts\Config\Repository;
use Illuminate\Contracts\Container\Container;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Contracts\View\Factory;
use Illuminate\Contracts\View\View;
use Illuminate\Support\HtmlString;
use Lattice\Blocks\Exceptions\MissingHtmlRenderer;

/**
 * Turns a stored document into plain HTML for outputs outside a Lattice page,
 * such as a public route. Each block renders through its `html()`, children
 * arrive as markup in the block's slots, and every block is wrapped in a frame
 * that applies its generic style through {@see StyleClassMap}.
 */
final readonly class BlockHtmlRenderer
{
    public function __construct(
        private BlockRegistry $blocks,
        private Factory $views,
        private Repository $config,
        private Container $container,
        private StyleClassMap $styles,
    ) {}

    public function render(BlockDocument $document): HtmlString
    {
        return new HtmlString(implode('', array_map($this->renderNode(...), $document->blocks)));
    }

    public function renderNode(BlockNode $node): string
    {
        $definition = $this->blocks->find($node->type);

        if (! $definition instanceof BlockDefinition) {
            return $this->fallback($node);
        }

        $slots = $this->blocks->slotsFor($definition, $node->data);
        $children = [];

        foreach (array_keys($slots) as $name) {
            $children[$name] = array_map($this->renderNode(...), $node->slots[$name] ?? []);
        }

        $html = $definition->html(
            $this->blocks->castData($definition, $node->data),
            new BlockSlots($node, $slots, html: $children),
        );

        if ($html === null) {
            return $this->fallback($node);
        }

        $markup = $this->markup($html);

        return $markup === '' ? '' : $this->frame($node, $markup);
    }

    private function frame(BlockNode $node, string $content): string
    {
        return $this->views->make('blocks::frame', [
            'node' => $node,
            'classes' => $this->styles->classesFor($node->style),
            'content' => new HtmlString($content),
        ])->render();
    }

    private function fallback(BlockNode $node): string
    {
        $fallback = $this->config->get('lattice.blocks.html_fallback');

        if (is_string($fallback) && class_exists($fallback)) {
            $fallback = $this->container->make($fallback);
        }

        if (! is_callable($fallback)) {
            throw new MissingHtmlRenderer($node->type);
        }

        return $this->markup($fallback($node));
    }

    private function markup(mixed $html): string
    {
        return match (true) {
            $html instanceof View => $html->render(),
            $html instanceof Htmlable => $html->toHtml(),
            is_string($html) => $html,
            default => '',
        };
    }
}

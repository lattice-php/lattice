<?php
declare(strict_types=1);

namespace Lattice\Media\Forms\RichEditor;

use Tiptap\Core\Node;
use Tiptap\Utils\HTML;

/**
 * The server-side schema for the `mediaImage` document node. The canonical
 * attrs are `{id, alt, conversion}`; `url`, `width`, `height` and `mediaAlt`
 * are ephemeral — injected by MediaImage::prepareDocument() on the way out and
 * never stored.
 */
final class MediaImageNode extends Node
{
    /** @var string */
    public static $name = 'mediaImage';

    /**
     * @return array<string, array{default: null}>
     */
    #[\Override]
    public function addAttributes(): array
    {
        return [
            'id' => ['default' => null],
            'alt' => ['default' => null],
            'conversion' => ['default' => null],
            'url' => ['default' => null],
            'width' => ['default' => null],
            'height' => ['default' => null],
            'mediaAlt' => ['default' => null],
        ];
    }

    /**
     * @param  \stdClass  $node
     * @param  array<string, mixed>  $HTMLAttributes
     * @return array<int, mixed>
     */
    public function renderHTML($node, $HTMLAttributes = []): array
    {
        $url = $node->attrs->url ?? null;

        if (! is_string($url) || $url === '') {
            // Deleted media: render nothing visible rather than a broken img.
            return ['span', []];
        }

        return ['img', HTML::mergeAttributes($HTMLAttributes, array_filter([
            'src' => $url,
            'alt' => $node->attrs->alt ?? $node->attrs->mediaAlt ?? '',
            'width' => $node->attrs->width ?? null,
            'height' => $node->attrs->height ?? null,
            'loading' => 'lazy',
            'data-media-id' => isset($node->attrs->id) ? (string) $node->attrs->id : null,
            'data-conversion' => $node->attrs->conversion ?? null,
        ], static fn (mixed $value): bool => $value !== null))];
    }
}

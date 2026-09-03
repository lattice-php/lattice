<?php
declare(strict_types=1);

namespace Lattice\Blocks\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Attributes\WireMap;
use Lattice\Form\RichContent;
use Lattice\Ui\Components\Component;

/**
 * A rich-text document rendered as sanitized HTML. Carrying the document
 * alongside the HTML lets the block editor swap the node for an inline editor
 * (which shows the placeholder) while every other renderer shows the
 * server-rendered markup and nothing for an empty document.
 */
#[AsComponent('blocks.rich-text')]
class RichText extends Component
{
    /** @var array<string, mixed>|null */
    #[WireMap]
    public ?array $document = null;

    public string $html = '';

    public ?string $placeholder = null;

    /**
     * @param  array<string, mixed>|null  $document
     */
    public static function make(?array $document, ?string $placeholder = null, ?string $key = null): static
    {
        $component = new static($key);
        $component->document = $document;
        $component->placeholder = $placeholder;
        $component->html = self::toHtml($document);

        return $component;
    }

    /**
     * @param  array<string, mixed>|null  $document
     */
    public static function isBlank(?array $document): bool
    {
        return $document === null || trim(RichContent::make($document)->toText()) === '';
    }

    /**
     * @param  array<string, mixed>|null  $document
     */
    public static function toHtml(?array $document): string
    {
        return $document === null ? '' : '<div class="lt-blocks-prose">'.RichContent::make($document)->toHtml().'</div>';
    }
}

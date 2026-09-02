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
 * while every other renderer shows the server-rendered markup.
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
        $component->html = $document === null
            ? ($placeholder === null ? '' : '<p class="text-lt-muted-fg">'.e($placeholder).'</p>')
            : '<div class="lt-blocks-prose">'.RichContent::make($document)->toHtml().'</div>';

        return $component;
    }
}

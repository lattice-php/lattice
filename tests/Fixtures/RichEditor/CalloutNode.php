<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\RichEditor;

use Tiptap\Core\Node;
use Tiptap\Utils\HTML;

final class CalloutNode extends Node
{
    public static $name = 'callout';

    public function addAttributes(): array
    {
        return [
            'id' => ['default' => null],
            'tone' => ['default' => null],
        ];
    }

    public function renderHTML($node, $HTMLAttributes = []): array
    {
        return [
            'aside',
            HTML::mergeAttributes($HTMLAttributes, [
                'data-callout' => (string) ($node->attrs->id ?? ''),
                'data-tone' => $node->attrs->tone ?? null,
            ]),
            0,
        ];
    }
}

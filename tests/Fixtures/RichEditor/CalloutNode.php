<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\RichEditor;

use Tiptap\Core\Node;
use Tiptap\Utils\HTML;

final class CalloutNode extends Node
{
    /** @var string */
    public static $name = 'callout';

    /**
     * @return array<string, array<string, mixed>>
     */
    #[\Override]
    public function addAttributes(): array
    {
        return [
            'id' => ['default' => null],
            'tone' => ['default' => null],
        ];
    }

    /**
     * @param  mixed  $node
     * @param  array<string, mixed>  $HTMLAttributes
     * @return array{0: string, 1: array<string, mixed>, 2: int}
     */
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

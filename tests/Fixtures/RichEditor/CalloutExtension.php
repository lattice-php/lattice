<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\RichEditor;

use Lattice\Lattice\Forms\RichEditor\Attributes\AsEditorExtension;
use Lattice\Lattice\Forms\RichEditor\EditorExtension;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;

#[AsEditorExtension('callout')]
final class CalloutExtension extends EditorExtension
{
    protected array $serverTypes = ['callout'];

    public function serverExtensions(): array
    {
        return [new CalloutNode];
    }

    public function ephemeralAttributes(): array
    {
        return ['callout' => ['resolvedLabel']];
    }

    public function prepareDocument(array $document): array
    {
        $walk = static function (array $node) use (&$walk): array {
            if (($node['type'] ?? null) === 'callout') {
                $node['attrs']['resolvedLabel'] = 'callout-'.($node['attrs']['id'] ?? '?');
            }

            if (isset($node['content']) && is_array($node['content'])) {
                $node['content'] = array_map($walk, $node['content']);
            }

            return $node;
        };

        return $walk($document);
    }

    public function configureSanitizer(HtmlSanitizerConfig $config): HtmlSanitizerConfig
    {
        return $config->allowElement('aside', ['data-callout', 'data-tone']);
    }
}

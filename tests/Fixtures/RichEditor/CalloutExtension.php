<?php

declare(strict_types=1);

namespace Lattice\Tests\Fixtures\RichEditor;

use Lattice\Form\RichEditor\Attributes\AsEditorExtension;
use Lattice\Form\RichEditor\EditorExtension;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;

#[AsEditorExtension('callout')]
final class CalloutExtension extends EditorExtension
{
    protected array $serverTypes = ['callout'];

    #[\Override]
    public function serverExtensions(): array
    {
        return [new CalloutNode];
    }

    #[\Override]
    public function ephemeralAttributes(): array
    {
        return ['callout' => ['resolvedLabel']];
    }

    #[\Override]
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

    #[\Override]
    public function configureSanitizer(HtmlSanitizerConfig $config): HtmlSanitizerConfig
    {
        return $config->allowElement('aside', ['data-callout', 'data-tone']);
    }

    #[\Override]
    public function validateDocument(array $document): array
    {
        $messages = [];

        $walk = static function (array $node) use (&$walk, &$messages): void {
            if (($node['type'] ?? null) === 'callout' && ($node['attrs']['id'] ?? 0) >= 100) {
                $messages[] = 'Callout '.$node['attrs']['id'].' does not exist.';
            }

            foreach (is_array($node['content'] ?? null) ? $node['content'] : [] as $child) {
                if (is_array($child)) {
                    $walk($child);
                }
            }
        };

        $walk($document);

        return $messages;
    }
}

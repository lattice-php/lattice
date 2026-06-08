<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Forms;

use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;
use Tiptap\Editor;
use Tiptap\Extensions\StarterKit;

/**
 * Renders a TipTap JSON document to safe HTML (or text) for display.
 *
 * The document is schema-validated by tiptap-php (unknown nodes/marks are
 * stripped) and the rendered HTML is sanitized with Symfony's HtmlSanitizer.
 */
final class RichContent
{
    /**
     * @param  array<string, mixed>|string|null  $document
     */
    public function __construct(private readonly array|string|null $document) {}

    /**
     * @param  array<string, mixed>|string|null  $document
     */
    public static function make(array|string|null $document): self
    {
        return new self($document);
    }

    public function toHtml(): string
    {
        if ($this->isEmpty()) {
            return '';
        }

        return $this->sanitize($this->editor()->getHTML());
    }

    public function toText(): string
    {
        if ($this->isEmpty()) {
            return '';
        }

        return $this->editor()->getText();
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        if ($this->isEmpty()) {
            return ['type' => 'doc', 'content' => []];
        }

        return $this->editor()->getDocument();
    }

    private function editor(): Editor
    {
        return (new Editor(['extensions' => [new StarterKit]]))->setContent($this->document);
    }

    private function isEmpty(): bool
    {
        return $this->document === null || $this->document === '' || $this->document === [];
    }

    private function sanitize(string $html): string
    {
        $config = (new HtmlSanitizerConfig)
            ->allowSafeElements()
            ->allowLinkSchemes(['https', 'http', 'mailto']);

        return (new HtmlSanitizer($config))->sanitize($html);
    }
}

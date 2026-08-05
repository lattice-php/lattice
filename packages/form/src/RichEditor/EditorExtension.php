<?php
declare(strict_types=1);

namespace Lattice\Form\RichEditor;

use JsonSerializable;
use Lattice\Core\Support\Wire;
use Lattice\Form\RichEditor\Attributes\AsEditorExtension;
use Lattice\Ui\Components\Concerns\SerializesToWire;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;
use Tiptap\Core\Extension;

/**
 * A rich-editor extension: a `{type, props}` wire value whose props are the
 * public typed properties (the shared wire convention). The type comes from
 * #[AsEditorExtension]; configuration mutates through fluent setters like a
 * form field.
 *
 * @phpstan-consistent-constructor
 */
abstract class EditorExtension implements JsonSerializable
{
    use SerializesToWire;

    /**
     * The tiptap schema names (nodes and marks) this type activates in
     * submitted documents. Types outside every active extension are stripped
     * server-side, so an extension leaving this empty (the default) must not
     * produce document nodes of its own.
     *
     * @var list<string>
     */
    protected array $serverTypes = [];

    public static function make(): static
    {
        return new static;
    }

    /**
     * @return list<string>
     */
    public function serverTypes(): array
    {
        return $this->serverTypes;
    }

    /**
     * tiptap-php extensions contributed to RichContent's schema: the node/mark
     * survives sanitization and renders to HTML via its own renderHTML. Types
     * covered here need no serverTypes entry.
     *
     * @return list<Extension>
     */
    public function serverExtensions(): array
    {
        return [];
    }

    /**
     * Outbound-only attrs by node type — injected by prepareDocument() for
     * display/editing, stripped from the canonical storage form. Needed
     * because tiptap-php round-trips undeclared attrs untouched.
     *
     * @return array<string, list<string>>
     */
    public function ephemeralAttributes(): array
    {
        return [];
    }

    /**
     * Transform a document on its way out of the server — form prefill and
     * HTML/text rendering. The place to batch-resolve stored references into
     * displayable ephemeral attrs; runs once per document, so resolve in bulk.
     *
     * @param  array<string, mixed>  $document
     * @return array<string, mixed>
     */
    public function prepareDocument(array $document): array
    {
        return $document;
    }

    /**
     * Extend the display sanitizer with the elements/attributes this
     * extension's renderHTML emits — the sanitizer strips everything it was
     * not explicitly told about.
     */
    public function configureSanitizer(HtmlSanitizerConfig $config): HtmlSanitizerConfig
    {
        return $config;
    }

    /**
     * Validate this extension's nodes in a submitted document — e.g. can the
     * user reference this id. Returned messages become field errors.
     *
     * @param  array<string, mixed>  $document
     * @return list<string>
     */
    public function validateDocument(array $document): array
    {
        return [];
    }

    /**
     * @return array<string, mixed>
     */
    public function toWire(): array
    {
        return ['type' => $this->wireType(), 'props' => Wire::map($this->wireProps())];
    }

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return $this->toWire();
    }

    public function wireType(): string
    {
        /** @var array<class-string, string> $cache */
        static $cache = [];

        return $cache[static::class] ??= AsEditorExtension::wireTypeForClass(static::class);
    }
}

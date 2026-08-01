<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms;

use Lattice\Lattice\Forms\RichEditor\EditorExtension;
use Lattice\Lattice\Forms\RichEditor\EditorExtensionRegistry;
use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;
use Tiptap\Core\Extension;
use Tiptap\Editor;
use Tiptap\Extensions\TextAlign;
use Tiptap\Marks\Bold;
use Tiptap\Marks\Code;
use Tiptap\Marks\Highlight;
use Tiptap\Marks\Italic;
use Tiptap\Marks\Link;
use Tiptap\Marks\Strike;
use Tiptap\Marks\Underline;
use Tiptap\Nodes\Blockquote;
use Tiptap\Nodes\BulletList;
use Tiptap\Nodes\CodeBlock;
use Tiptap\Nodes\Details;
use Tiptap\Nodes\DetailsContent;
use Tiptap\Nodes\DetailsSummary;
use Tiptap\Nodes\Document;
use Tiptap\Nodes\HardBreak;
use Tiptap\Nodes\Heading;
use Tiptap\Nodes\HorizontalRule;
use Tiptap\Nodes\ListItem;
use Tiptap\Nodes\OrderedList;
use Tiptap\Nodes\Paragraph;
use Tiptap\Nodes\Table;
use Tiptap\Nodes\TableCell;
use Tiptap\Nodes\TableHeader;
use Tiptap\Nodes\TableRow;
use Tiptap\Nodes\Text;

/**
 * Renders a TipTap JSON document to safe HTML (or text) for display.
 *
 * Nodes and marks outside the schema are stripped from the document — the
 * whole built-in schema by default, or only the given types when a field
 * narrows it to its active extensions — and the rendered HTML is sanitized
 * with Symfony's HtmlSanitizer.
 */
final class RichContent
{
    /**
     * The schema types every document may use regardless of the allowed set —
     * a document can't exist without them.
     */
    private const array BASELINE_TYPES = ['doc', 'paragraph', 'text', 'hardBreak'];

    private ?Editor $editor = null;

    /**
     * @var list<Extension>|null
     */
    private ?array $schema = null;

    /**
     * @var array<string, mixed>|null
     */
    private ?array $preparedDocument = null;

    /**
     * @var list<EditorExtension>|null
     */
    private ?array $resolvedExtensions = null;

    /**
     * @param  array<string, mixed>|string|null  $document
     * @param  list<string>|null  $allowedTypes  Schema type names to keep beyond the baseline; null keeps the full built-in schema.
     * @param  iterable<EditorExtension>|null  $extensions  Null falls back to the app-wide registry; an explicit iterable (including empty) is used as-is.
     */
    public function __construct(
        private readonly array|string|null $document,
        private readonly ?array $allowedTypes = null,
        private readonly ?iterable $extensions = null,
    ) {}

    /**
     * @param  array<string, mixed>|string|null  $document
     * @param  list<string>|null  $allowedTypes
     * @param  iterable<EditorExtension>|null  $extensions
     */
    public static function make(array|string|null $document, ?array $allowedTypes = null, ?iterable $extensions = null): self
    {
        return new self($document, $allowedTypes, $extensions);
    }

    public function toHtml(): string
    {
        if ($this->isEmpty()) {
            return '';
        }

        return $this->sanitize($this->preparedEditor()->getHTML());
    }

    public function toText(): string
    {
        if ($this->isEmpty()) {
            return '';
        }

        return $this->preparedEditor()->getText();
    }

    private function preparedEditor(): Editor
    {
        return new Editor(['extensions' => $this->schema()])->setContent($this->toPreparedArray());
    }

    /**
     * The submitted form value as a document array, or null when it isn't one
     * (not a string, empty, or not valid JSON for an array).
     *
     * @return array<string, mixed>|null
     */
    public static function decodeDocument(mixed $value): ?array
    {
        if (! is_string($value) || $value === '') {
            return null;
        }

        $decoded = json_decode($value, true);

        return is_array($decoded) ? $decoded : null;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        if ($this->isEmpty()) {
            return ['type' => 'doc', 'content' => []];
        }

        return $this->scrubEphemeral($this->editor()->getDocument());
    }

    /**
     * The display/editing form: canonical document with every extension's
     * outbound preparation applied (ephemeral attrs injected).
     *
     * @return array<string, mixed>
     */
    public function toPreparedArray(): array
    {
        if ($this->preparedDocument !== null) {
            return $this->preparedDocument;
        }

        $document = $this->toArray();

        foreach ($this->activeExtensions() as $extension) {
            $document = $extension->prepareDocument($document);
        }

        return $this->preparedDocument = $document;
    }

    /**
     * Matching nodes from the canonical document, depth-first. The typed
     * traversal consumers would otherwise hand-roll (e.g. collecting media
     * references for attachment sync).
     *
     * @return list<array<string, mixed>>
     */
    public function nodes(string $type): array
    {
        $collect = static function (array $node) use (&$collect, $type): array {
            $matches = ($node['type'] ?? null) === $type ? [$node] : [];

            foreach (is_array($node['content'] ?? null) ? $node['content'] : [] as $child) {
                if (is_array($child)) {
                    $matches = [...$matches, ...$collect($child)];
                }
            }

            return $matches;
        };

        return $collect($this->toArray());
    }

    /**
     * The active extension set: exactly what was given, including an explicit
     * empty iterable (a field that activates none of them must strip their
     * nodes everywhere — display, validation, and cast alike). Only an
     * omitted argument (null) falls back to the app-wide registry defaults —
     * the bare display path `RichContent::make($doc)`. Narrow with
     * $allowedTypes, not an explicit `[]` here.
     *
     * @return list<EditorExtension>
     */
    private function activeExtensions(): array
    {
        if ($this->resolvedExtensions !== null) {
            return $this->resolvedExtensions;
        }

        if ($this->extensions === null) {
            return $this->resolvedExtensions = app(EditorExtensionRegistry::class)->instances();
        }

        return $this->resolvedExtensions = is_array($this->extensions)
            ? array_values($this->extensions)
            : iterator_to_array($this->extensions, false);
    }

    private function editor(): Editor
    {
        if ($this->editor instanceof Editor) {
            return $this->editor;
        }

        $schema = $this->schema();
        // Allowed types beyond the schema stay stored (a custom extension may
        // own them) — rendering skips what the schema can't serialize anyway.
        $allowed = array_values(array_unique([
            ...array_map(static fn (Extension $extension): string => $extension::$name, $schema),
            ...$this->allowedTypes ?? [],
        ]));
        $document = is_array($this->document) ? $this->filter($this->document, $allowed) : $this->document;

        return $this->editor = new Editor(['extensions' => $schema])->setContent($document ?? ['type' => 'doc', 'content' => []]);
    }

    /**
     * tiptap-php's schema never removes unknown types from a JSON tree — its
     * HTML path filters implicitly while parsing, but an array document passes
     * through untouched. This walk is the JSON-side equivalent: nodes and
     * marks whose type is outside the schema are dropped.
     *
     * @param  array<string, mixed>  $node
     * @param  list<string>  $allowed
     * @return array<string, mixed>|null
     */
    private function filter(array $node, array $allowed): ?array
    {
        if (isset($node['type']) && ! in_array($node['type'], $allowed, true)) {
            return null;
        }

        if (isset($node['marks']) && is_array($node['marks'])) {
            $marks = array_values(array_filter(
                $node['marks'],
                static fn (mixed $mark): bool => is_array($mark) && in_array($mark['type'] ?? null, $allowed, true),
            ));

            if ($marks === []) {
                unset($node['marks']);
            } else {
                $node['marks'] = $marks;
            }
        }

        if (isset($node['content']) && is_array($node['content'])) {
            $node['content'] = array_values(array_filter(array_map(
                fn (mixed $child): ?array => is_array($child) ? $this->filter($child, $allowed) : null,
                $node['content'],
            )));
        }

        return $node;
    }

    /**
     * @return list<Extension>
     */
    private function schema(): array
    {
        if ($this->schema !== null) {
            return $this->schema;
        }

        $extensions = [
            new Document,
            new Paragraph,
            new Text,
            new HardBreak,
            new Bold,
            new Italic,
            new Strike,
            new Underline,
            new Code,
            new Highlight,
            new Heading,
            new Blockquote,
            new BulletList,
            new OrderedList,
            new ListItem,
            new CodeBlock,
            new HorizontalRule,
            new Link(['allowedProtocols' => ['https', 'http', 'mailto']]),
            new TextAlign(['types' => ['heading', 'paragraph']]),
            new Table,
            new TableRow,
            new TableHeader,
            new TableCell,
            new Details,
            new DetailsSummary,
            new DetailsContent,
        ];

        $allowed = [...self::BASELINE_TYPES, ...$this->allowedTypes ?? []];

        $builtin = $this->allowedTypes === null
            ? $extensions
            : array_values(array_filter(
                $extensions,
                static fn (Extension $extension): bool => in_array($extension::$name, $allowed, true),
            ));

        return $this->schema = [...$builtin, ...$this->contributedExtensions()];
    }

    /**
     * @return list<Extension>
     */
    private function contributedExtensions(): array
    {
        $contributed = [];

        foreach ($this->activeExtensions() as $extension) {
            $contributed = [...$contributed, ...$extension->serverExtensions()];
        }

        return $contributed;
    }

    /**
     * @param  array<string, mixed>  $node
     * @return array<string, mixed>
     */
    private function scrubEphemeral(array $node): array
    {
        $ephemeral = [];

        foreach ($this->activeExtensions() as $extension) {
            foreach ($extension->ephemeralAttributes() as $type => $attributes) {
                $ephemeral[$type] = [...$ephemeral[$type] ?? [], ...$attributes];
            }
        }

        return $ephemeral === [] ? $node : $this->withoutAttributes($node, $ephemeral);
    }

    /**
     * @param  array<string, mixed>  $node
     * @param  array<string, list<string>>  $ephemeral
     * @return array<string, mixed>
     */
    private function withoutAttributes(array $node, array $ephemeral): array
    {
        $type = $node['type'] ?? null;

        if (is_string($type) && isset($ephemeral[$type], $node['attrs']) && is_array($node['attrs'])) {
            $node['attrs'] = array_diff_key($node['attrs'], array_flip($ephemeral[$type]));

            if ($node['attrs'] === []) {
                unset($node['attrs']);
            }
        }

        if (isset($node['content']) && is_array($node['content'])) {
            $node['content'] = array_values(array_map(
                fn (array $child): array => $this->withoutAttributes($child, $ephemeral),
                array_filter($node['content'], is_array(...)),
            ));
        }

        return $node;
    }

    private function isEmpty(): bool
    {
        return in_array($this->document, [null, '', []], true);
    }

    private function sanitize(string $html): string
    {
        $config = (new HtmlSanitizerConfig)
            ->allowSafeElements()
            ->allowLinkSchemes(['https', 'http', 'mailto'])
            ->allowElement('table')
            ->allowElement('thead')
            ->allowElement('tbody')
            ->allowElement('tfoot')
            ->allowElement('tr')
            ->allowElement('th', ['colspan', 'rowspan'])
            ->allowElement('td', ['colspan', 'rowspan'])
            ->allowElement('details', ['open'])
            ->allowElement('summary')
            ->allowAttribute('style', ['p', 'h1', 'h2', 'h3']);

        foreach ($this->activeExtensions() as $extension) {
            $config = $extension->configureSanitizer($config);
        }

        return new HtmlSanitizer($config)->sanitize($html);
    }
}

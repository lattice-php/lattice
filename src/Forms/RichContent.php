<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms;

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
     * @param  array<string, mixed>|string|null  $document
     * @param  list<string>|null  $allowedTypes  Schema type names to keep beyond the baseline; null keeps the full built-in schema.
     */
    public function __construct(
        private readonly array|string|null $document,
        private readonly ?array $allowedTypes = null,
    ) {}

    /**
     * @param  array<string, mixed>|string|null  $document
     * @param  list<string>|null  $allowedTypes
     */
    public static function make(array|string|null $document, ?array $allowedTypes = null): self
    {
        return new self($document, $allowedTypes);
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

        if ($this->allowedTypes === null) {
            return $extensions;
        }

        $allowed = [...self::BASELINE_TYPES, ...$this->allowedTypes];

        return array_values(array_filter(
            $extensions,
            static fn (Extension $extension): bool => in_array($extension::$name, $allowed, true),
        ));
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

        return new HtmlSanitizer($config)->sanitize($html);
    }
}

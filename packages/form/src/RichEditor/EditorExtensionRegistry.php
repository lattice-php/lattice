<?php
declare(strict_types=1);

namespace Lattice\Form\RichEditor;

use Lattice\Core\Support\WireTypeRegistry;
use Lattice\Form\RichEditor\Attributes\AsEditorExtension;
use Lattice\Form\RichEditor\Extensions\Blockquote;
use Lattice\Form\RichEditor\Extensions\Bold;
use Lattice\Form\RichEditor\Extensions\BulletList;
use Lattice\Form\RichEditor\Extensions\Code;
use Lattice\Form\RichEditor\Extensions\CodeBlock;
use Lattice\Form\RichEditor\Extensions\Details;
use Lattice\Form\RichEditor\Extensions\Emoji;
use Lattice\Form\RichEditor\Extensions\Heading;
use Lattice\Form\RichEditor\Extensions\Highlight;
use Lattice\Form\RichEditor\Extensions\HorizontalRule;
use Lattice\Form\RichEditor\Extensions\Italic;
use Lattice\Form\RichEditor\Extensions\Link;
use Lattice\Form\RichEditor\Extensions\OrderedList;
use Lattice\Form\RichEditor\Extensions\Strike;
use Lattice\Form\RichEditor\Extensions\Table;
use Lattice\Form\RichEditor\Extensions\TextAlign;
use Lattice\Form\RichEditor\Extensions\Underline;

/**
 * The single source of truth for rich-editor extensions: wire type → class-string.
 * Drives TypeScript generation and resolves the string shorthand in
 * RichEditor::extensions(). It is NOT a gate for emitting — an unregistered
 * string still wires as a bare type for client-registered extensions.
 *
 * @extends WireTypeRegistry<EditorExtension>
 */
final class EditorExtensionRegistry extends WireTypeRegistry
{
    private const array BUILTINS = [
        Blockquote::class,
        Bold::class,
        BulletList::class,
        Code::class,
        CodeBlock::class,
        Details::class,
        Emoji::class,
        Heading::class,
        Highlight::class,
        HorizontalRule::class,
        Italic::class,
        Link::class,
        OrderedList::class,
        Strike::class,
        Table::class,
        TextAlign::class,
        Underline::class,
    ];

    /**
     * A fresh registry holding only the package's built-in extensions. Used by
     * the container binding and by TypeScript generation, both of which need the
     * built-in set independent of an application's runtime registrations.
     */
    public static function withBuiltins(): self
    {
        $registry = new self;

        foreach (self::BUILTINS as $extension) {
            $registry->register($extension);
        }

        return $registry;
    }

    /**
     * One configured-with-defaults instance per registered extension class —
     * the app-wide set the bare RichContent display path renders with.
     *
     * @return list<EditorExtension>
     */
    public function instances(): array
    {
        return array_map(
            static fn (string $class): EditorExtension => $class::make(),
            array_values($this->all()),
        );
    }

    #[\Override]
    public static function attribute(): string
    {
        return AsEditorExtension::class;
    }

    #[\Override]
    public static function baseClass(): string
    {
        return EditorExtension::class;
    }
}

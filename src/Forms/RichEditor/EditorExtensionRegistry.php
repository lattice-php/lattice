<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\RichEditor;

use Lattice\Lattice\Forms\RichEditor\Attributes\AsEditorExtension;
use Lattice\Lattice\Forms\RichEditor\Extensions\Blockquote;
use Lattice\Lattice\Forms\RichEditor\Extensions\Bold;
use Lattice\Lattice\Forms\RichEditor\Extensions\BulletList;
use Lattice\Lattice\Forms\RichEditor\Extensions\Code;
use Lattice\Lattice\Forms\RichEditor\Extensions\CodeBlock;
use Lattice\Lattice\Forms\RichEditor\Extensions\Details;
use Lattice\Lattice\Forms\RichEditor\Extensions\Emoji;
use Lattice\Lattice\Forms\RichEditor\Extensions\Heading;
use Lattice\Lattice\Forms\RichEditor\Extensions\Highlight;
use Lattice\Lattice\Forms\RichEditor\Extensions\HorizontalRule;
use Lattice\Lattice\Forms\RichEditor\Extensions\Italic;
use Lattice\Lattice\Forms\RichEditor\Extensions\Link;
use Lattice\Lattice\Forms\RichEditor\Extensions\OrderedList;
use Lattice\Lattice\Forms\RichEditor\Extensions\Strike;
use Lattice\Lattice\Forms\RichEditor\Extensions\Table;
use Lattice\Lattice\Forms\RichEditor\Extensions\TextAlign;
use Lattice\Lattice\Forms\RichEditor\Extensions\Underline;
use Lattice\Lattice\Support\WireTypeRegistry;

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

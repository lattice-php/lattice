<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\RichEditor;

use Lattice\Lattice\Forms\RichEditor\Attributes\AsEditorExtension;
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
    /**
     * A fresh registry holding only the package's built-in extensions. Used by
     * the container binding and by TypeScript generation, both of which need the
     * built-in set independent of an application's runtime registrations.
     */
    public static function withBuiltins(): self
    {
        $registry = new self;
        $registry->registerAllIn(__DIR__.'/Extensions');

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

<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\RichEditor\Attributes;

use Attribute;
use Lattice\Lattice\Attributes\WireType;

/**
 * Marks a rich-editor extension value object and declares its wire type — the
 * discriminant that keys the `EditorExtension` union. Types stay bare
 * ("heading", not "editor.heading"): they resolve against the editor-extension
 * registry, not the component registry, so there is no namespace collision.
 */
#[Attribute(Attribute::TARGET_CLASS)]
final readonly class AsEditorExtension extends WireType
{
    #[\Override]
    public function typeNamePrefix(): string
    {
        return 'Editor';
    }
}

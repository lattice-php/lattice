<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\RichEditor;

use JsonSerializable;
use Lattice\Lattice\Forms\RichEditor\Attributes\AsEditorExtension;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Ui\Components\Concerns\SerializesToWire;

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

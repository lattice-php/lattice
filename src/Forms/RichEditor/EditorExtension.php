<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\RichEditor;

use JsonSerializable;
use Lattice\Lattice\Forms\RichEditor\Attributes\AsEditorExtension;
use Lattice\Lattice\Ui\Components\Concerns\SerializesToWire;

/**
 * A rich-editor extension: `{type}` plus `{props}` when configured, following
 * the shared wire convention (a public typed property is a wire prop). The type
 * comes from #[AsEditorExtension]; configuration mutates through fluent setters
 * like a form field, so `Heading::make()->levels(1, 2)` reads naturally.
 *
 * @phpstan-consistent-constructor
 */
abstract class EditorExtension implements JsonSerializable
{
    use SerializesToWire;

    public static function make(): static
    {
        return new static;
    }

    /**
     * @return array<string, mixed>
     */
    public function toWire(): array
    {
        $props = $this->wireProps();

        return $props === []
            ? ['type' => $this->wireType()]
            : ['type' => $this->wireType(), 'props' => $props];
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

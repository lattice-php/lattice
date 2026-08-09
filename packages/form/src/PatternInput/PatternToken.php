<?php

declare(strict_types=1);

namespace Lattice\Form\PatternInput;

use Illuminate\Support\Str;
use Lattice\Form\Components\Field;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\Concerns\HasChildSchema;

/**
 * A pattern token definition: the name a chip inserts into a PatternInput's
 * segment array, and (optionally) the schema of Fields its config popover
 * renders. Compiles to a `PatternTokenData` value object for wire
 * serialization.
 *
 * @api
 */
final class PatternToken
{
    use HasChildSchema;

    private ?string $label = null;

    private function __construct(public readonly string $name) {}

    public static function make(string $name): self
    {
        return new self($name);
    }

    public function label(string $label): self
    {
        $this->label = $label;

        return $this;
    }

    /**
     * The Fields a selected token's config popover renders, e.g. a Choice
     * constraining NUMBER's zero-padding width.
     *
     * @param  array<int, Field>  $fields
     */
    public function configurable(array $fields): self
    {
        return $this->schema($fields);
    }

    /**
     * @return array<int, Field>
     */
    public function fields(): array
    {
        return array_values(array_filter(
            $this->resolvedChildren(),
            static fn (Component $child): bool => $child instanceof Field,
        ));
    }

    public function data(): PatternTokenData
    {
        return new PatternTokenData(
            name: $this->name,
            label: $this->label ?? Str::headline($this->name),
            schema: array_values($this->renderableChildren()),
        );
    }
}

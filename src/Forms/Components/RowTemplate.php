<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Illuminate\Support\Str;
use JsonSerializable;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\Concerns\HasChildSchema;

/**
 * A typed row template for a TypedRowsField: the schema of child Fields a row
 * of this type is built, validated, and cast from. Serializes as
 * `{type, label, schema}`.
 *
 * @api
 */
final class RowTemplate implements JsonSerializable
{
    use HasChildSchema;

    private ?string $label = null;

    private function __construct(public readonly string $type) {}

    public static function make(string $type): self
    {
        return new self($type);
    }

    public function label(string $label): self
    {
        $this->label = $label;

        return $this;
    }

    /**
     * @return array<int, Field>
     */
    public function fields(): array
    {
        return array_values(array_filter(
            $this->children,
            static fn (Component $child): bool => $child instanceof Field,
        ));
    }

    /**
     * @return array{type: string, label: string, schema: array<int, mixed>}
     */
    public function jsonSerialize(): array
    {
        return [
            'type' => $this->type,
            'label' => $this->label ?? Str::headline($this->type),
            'schema' => $this->renderableChildren(),
        ];
    }
}

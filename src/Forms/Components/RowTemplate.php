<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Illuminate\Support\Str;
use JsonSerializable;
use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Components\Concerns\HasChildSchema;

/**
 * A typed row template for a TypedRowsField: the schema of child Fields a row
 * of this type is built, validated, and cast from. Serializes as
 * `{type, label, schema}`, plus `slots` when the row type declares named
 * child-row lists.
 *
 * @api
 */
final class RowTemplate implements JsonSerializable
{
    use HasChildSchema;

    private ?string $label = null;

    /**
     * @var array<int, string>
     */
    private array $slots = [];

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
     * @param  array<int, string>  $names
     */
    public function slots(array $names): self
    {
        $this->slots = array_values($names);

        return $this;
    }

    /**
     * @return array<int, string>
     */
    public function slotNames(): array
    {
        return $this->slots;
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
     * @return array{type: string, label: string, schema: array<int, mixed>, slots?: array<int, string>}
     */
    public function jsonSerialize(): array
    {
        return [
            'type' => $this->type,
            'label' => $this->label ?? Str::headline($this->type),
            'schema' => $this->renderableChildren(),
            ...($this->slots === [] ? [] : ['slots' => $this->slots]),
        ];
    }
}

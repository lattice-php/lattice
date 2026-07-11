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

    private ?string $icon = null;

    private ?string $description = null;

    /**
     * @var array<int, array{name: string, label?: string, blocks?: array<int, string>}>
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

    public function icon(?string $icon): self
    {
        $this->icon = $icon;

        return $this;
    }

    public function description(?string $description): self
    {
        $this->description = $description;

        return $this;
    }

    /**
     * Declare the row type's named child-row lists: plain names for
     * unrestricted slots, or shapes carrying a label and the row types the
     * slot is restricted to.
     *
     * @param  array<int, array{name: string, label?: string, blocks?: array<int, string>}|string>  $slots
     */
    public function slots(array $slots): self
    {
        $this->slots = array_values(array_map(
            static fn (array|string $slot): array => is_string($slot) ? ['name' => $slot] : $slot,
            $slots,
        ));

        return $this;
    }

    /**
     * @return array<int, string>
     */
    public function slotNames(): array
    {
        return array_column($this->slots, 'name');
    }

    /**
     * The row types a slot accepts, or null when the slot is unrestricted.
     *
     * @return array<int, string>|null
     */
    public function slotAllowedTypes(string $name): ?array
    {
        foreach ($this->slots as $slot) {
            if ($slot['name'] === $name) {
                return $slot['blocks'] ?? null;
            }
        }

        return null;
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
     * @return array{type: string, label: string, icon?: string, description?: string, schema: array<int, mixed>, slots?: array<int, array{name: string, label?: string, blocks?: array<int, string>}>}
     */
    public function jsonSerialize(): array
    {
        return [
            'type' => $this->type,
            'label' => $this->label ?? Str::headline($this->type),
            ...($this->icon === null ? [] : ['icon' => $this->icon]),
            ...($this->description === null ? [] : ['description' => $this->description]),
            'schema' => $this->renderableChildren(),
            ...($this->slots === [] ? [] : ['slots' => $this->slots]),
        ];
    }
}

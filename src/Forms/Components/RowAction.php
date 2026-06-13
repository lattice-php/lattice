<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Forms\Enums\RowActionType;

/**
 * A per-row action declared on a Repeater or Builder. The built-in types map to
 * client-side row mutations (duplicate, remove). `label` and `icon` are null by
 * default so the client supplies the localised defaults.
 */
#[TypeScript]
final class RowAction implements JsonSerializable
{
    private function __construct(
        public RowActionType $type,
        public string $key,
        public ?string $label = null,
        public ?string $icon = null,
        public bool $destructive = false,
    ) {}

    public static function duplicate(): self
    {
        return new self(RowActionType::Duplicate, 'duplicate');
    }

    public static function remove(): self
    {
        return new self(RowActionType::Remove, 'remove', destructive: true);
    }

    public function label(string $label): self
    {
        $this->label = $label;

        return $this;
    }

    public function icon(string $icon): self
    {
        $this->icon = $icon;

        return $this;
    }

    public function destructive(bool $destructive = true): self
    {
        $this->destructive = $destructive;

        return $this;
    }

    /**
     * @return array{type: string, key: string, label: string|null, icon: string|null, destructive: bool}
     */
    public function jsonSerialize(): array
    {
        return [
            'type' => $this->type->value,
            'key' => $this->key,
            'label' => $this->label,
            'icon' => $this->icon,
            'destructive' => $this->destructive,
        ];
    }
}

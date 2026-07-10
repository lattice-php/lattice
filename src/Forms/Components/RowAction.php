<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use BackedEnum;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Concerns\GatesRendering;
use Lattice\Lattice\Forms\Enums\RowActionType;
use Lattice\Lattice\Support\Wire;

/**
 * A per-row action declared on a Repeater or Builder. The built-in types map to
 * client-side row mutations (duplicate, remove). `label` and `icon` are null by
 * default so the client supplies the localised defaults.
 *
 * `visible()`/`hidden()` resolve once per request when the row-actions array is
 * declared, not per row — repeater/builder rows are client-side state, so there
 * is no per-row render pass to re-evaluate against.
 */
#[TypeScript]
final class RowAction
{
    use GatesRendering;

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

    public function icon(BackedEnum|string $icon): self
    {
        $this->icon = Wire::scalar($icon);

        return $this;
    }

    public function destructive(bool $destructive = true): self
    {
        $this->destructive = $destructive;

        return $this;
    }
}

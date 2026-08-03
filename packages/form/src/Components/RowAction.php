<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Forms\Enums\RowActionType;
use Lattice\Lattice\Ui\Concerns\GatesRendering;
use Lattice\Lattice\Ui\Concerns\HasIcon;
use Lattice\Lattice\Ui\Concerns\HasLabel;
use Lattice\Lattice\Ui\Contracts\Renderable;

/**
 * A per-row action declared on a Repeater or Builder. The built-in types map to
 * client-side row mutations (duplicate, remove). `label` and `icon` are null by
 * default so the client supplies the localised defaults.
 *
 * `visible()`/`hidden()` resolve once per request when the row-actions array is
 * declared, not per row — repeater/builder rows are client-side state, so there
 * is no per-row render pass to re-evaluate against.
 *
 * `label`/`icon` are never passed to the constructor by the built-in factories
 * below, so both live entirely in their shared traits instead of constructor
 * promotion.
 */
#[TypeScript]
final class RowAction implements Renderable
{
    use GatesRendering;
    use HasIcon;
    use HasLabel;

    private function __construct(
        public RowActionType $type,
        public string $key,
        public bool $danger = false,
    ) {}

    public static function duplicate(): self
    {
        return new self(RowActionType::Duplicate, 'duplicate');
    }

    public static function remove(): self
    {
        return new self(RowActionType::Remove, 'remove', danger: true);
    }

    public function danger(bool $danger = true): self
    {
        $this->danger = $danger;

        return $this;
    }
}

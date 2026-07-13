<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Builtin;

use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\Ui\Components\Button;

/**
 * Toggles a sidebar entirely on the client: it collapses the icon rail on
 * desktop and opens the off-canvas drawer on smaller screens. Dispatch it from
 * a {@see Button} via `->effects(...)` so the
 * trigger can live anywhere in the layout.
 */
#[AsEffect('toggle-sidebar')]
final class ToggleSidebarEffect extends Effect
{
    public function __construct(
        public readonly ?string $target = null,
    ) {}
}

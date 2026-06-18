<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Builtin;

use Lattice\Lattice\Core\Components\Button;
use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;

/**
 * Toggles a sidebar entirely on the client: it collapses the icon rail on
 * desktop and opens the off-canvas drawer on smaller screens. Dispatch it from
 * a {@see Button} via `->effects(...)` so the
 * trigger can live anywhere in the layout.
 */
#[AsEffect('toggleSidebar')]
final readonly class ToggleSidebarEffect extends Effect
{
    public function __construct(
        public ?string $target = null,
    ) {}
}

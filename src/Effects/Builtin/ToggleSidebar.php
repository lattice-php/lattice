<?php
declare(strict_types=1);

namespace Lattice\Effects\Builtin;

use Lattice\Ui\Components\Button;
use Lattice\Ui\Effects\Attributes\AsEffect;
use Lattice\Ui\Effects\Effect;

/**
 * Toggles a sidebar entirely on the client: it collapses the icon rail on
 * desktop and opens the off-canvas drawer on smaller screens. Dispatch it from
 * a {@see Button} via `->effects(...)` so the
 * trigger can live anywhere in the layout.
 */
#[AsEffect('toggle-sidebar')]
final class ToggleSidebar extends Effect
{
    public function __construct(
        public readonly ?string $target = null,
    ) {}
}

<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Builtin;

use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;

/**
 * Reloads the current page. By default this is an Inertia visit
 * (`router.reload()`): props re-fetch but the persistent layout stays
 * mounted. Set `full` for a shell-invalidating change that needs a real
 * browser reload (`window.location.reload()`) — not for a stale callout,
 * which `Callout::retract()` handles instead.
 */
#[AsEffect('reload-page')]
final class ReloadPage extends Effect
{
    public function __construct(
        public readonly bool $full = false,
    ) {}
}

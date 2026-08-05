<?php
declare(strict_types=1);

namespace Lattice\Ui\Effects\Builtin;

use Lattice\Ui\Effects\Attributes\AsEffect;
use Lattice\Ui\Effects\Effect;

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

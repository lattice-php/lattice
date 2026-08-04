<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Builtin;

use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;

/**
 * States that a keyed callout no longer applies. A keyed callout is
 * otherwise only dropped on a URL-changing navigation, so a same-URL
 * response has no way to clear one.
 */
#[AsEffect('retract-callout')]
final class RetractCallout extends Effect
{
    public function __construct(
        public readonly string $unique,
    ) {}
}

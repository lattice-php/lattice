<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Builtin;

use Lattice\Lattice\Core\Values\Callout;
use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;

#[AsEffect('callout')]
final readonly class CalloutEffect extends Effect
{
    public function __construct(
        public Callout $callout,
    ) {}
}

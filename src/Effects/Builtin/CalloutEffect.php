<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Builtin;

use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\Ui\Values\Callout;

#[AsEffect('callout')]
final readonly class CalloutEffect extends Effect
{
    public function __construct(
        public Callout $callout,
    ) {}
}

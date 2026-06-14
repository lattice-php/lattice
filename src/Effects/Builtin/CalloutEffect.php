<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Builtin;

use Lattice\Lattice\Core\Values\Callout;
use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\Effects\Enums\EffectType;

#[AsEffect(EffectType::Callout)]
final readonly class CalloutEffect extends Effect
{
    public function __construct(
        public Callout $callout,
    ) {}
}

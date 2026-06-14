<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Enums\EffectType;
use Lattice\Lattice\Attributes;
use Lattice\Lattice\Core\Values\Callout;

#[Attributes\AsEffect(EffectType::Callout)]
final readonly class CalloutEffect extends AbstractEffect
{
    public function __construct(
        public Callout $callout,
    ) {}
}

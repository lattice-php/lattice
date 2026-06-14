<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Builtin;

use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\Effects\Enums\EffectType;

#[AsEffect(EffectType::ResetForm)]
final readonly class ResetFormEffect extends Effect
{
    public function __construct(
        public ?string $form = null,
    ) {}
}

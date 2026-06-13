<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Enums\EffectType;
use Lattice\Lattice\Attributes;
use Lattice\Lattice\Core\Values\ToastMessage;

#[Attributes\Effect(EffectType::Toast)]
final readonly class ToastEffect extends Effect
{
    public function __construct(
        public ToastMessage $toast,
    ) {}
}

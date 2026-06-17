<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Builtin;

use Lattice\Lattice\Core\Values\ToastMessage;
use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;

#[AsEffect('toast')]
final readonly class ToastEffect extends Effect
{
    public function __construct(
        public ToastMessage $toast,
    ) {}
}

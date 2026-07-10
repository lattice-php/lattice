<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Builtin;

use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\Ui\Values\ToastMessage;

#[AsEffect('toast')]
final readonly class ToastEffect extends Effect
{
    public function __construct(
        public ToastMessage $toast,
    ) {}
}

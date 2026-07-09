<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Builtin;

use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;

#[AsEffect('reset-form')]
final readonly class ResetFormEffect extends Effect
{
    public function __construct(
        public ?string $form = null,
    ) {}
}

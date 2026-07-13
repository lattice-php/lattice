<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Builtin;

use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;

#[AsEffect('reset-form')]
final class ResetForm extends Effect
{
    public function __construct(
        public readonly ?string $form = null,
    ) {}
}

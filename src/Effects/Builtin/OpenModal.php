<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Builtin;

use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;

#[AsEffect('open-modal')]
final class OpenModal extends Effect
{
    public function __construct(
        public readonly string $modal,
    ) {}
}

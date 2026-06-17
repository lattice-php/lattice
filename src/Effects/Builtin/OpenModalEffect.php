<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Builtin;

use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;

#[AsEffect('openModal')]
final readonly class OpenModalEffect extends Effect
{
    public function __construct(
        public string $modal,
    ) {}
}

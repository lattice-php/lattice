<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Builtin;

use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;

#[AsEffect('download')]
final class DownloadEffect extends Effect
{
    public function __construct(
        public readonly string $url,
    ) {}
}

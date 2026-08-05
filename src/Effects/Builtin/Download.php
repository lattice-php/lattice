<?php
declare(strict_types=1);

namespace Lattice\Effects\Builtin;

use Lattice\Ui\Effects\Attributes\AsEffect;
use Lattice\Ui\Effects\Effect;

#[AsEffect('download')]
final class Download extends Effect
{
    public function __construct(
        public readonly string $url,
    ) {}
}

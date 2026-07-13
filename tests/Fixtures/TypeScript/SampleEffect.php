<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\TypeScript;

use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;

#[AsEffect('sample-effect')]
final class SampleEffect extends Effect
{
    public function __construct(public string $target) {}
}

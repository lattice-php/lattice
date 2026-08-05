<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\TypeScript;

use Lattice\Ui\Effects\Attributes\AsEffect;
use Lattice\Ui\Effects\Effect;

#[AsEffect('sample-effect')]
final class SampleEffect extends Effect
{
    public function __construct(public string $target) {}
}

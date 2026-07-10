<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\TypeScript;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Components\Component;

#[TypeScript]
#[AsComponent('sample.dual-a')]
final class SampleDualMarkedA extends Component {}

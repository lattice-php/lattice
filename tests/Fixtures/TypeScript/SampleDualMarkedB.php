<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\TypeScript;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Ui\Components\Component;

#[AsComponent('sample.dual-b')]
#[TypeScript]
final class SampleDualMarkedB extends Component {}

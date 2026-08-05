<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\TypeScript;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Attributes\TypeScript;
use Lattice\Ui\Components\Component;

#[AsComponent('sample.dual-b')]
#[TypeScript]
final class SampleDualMarkedB extends Component {}

<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\TypeScript;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Attributes\TypeScript;
use Lattice\Ui\Components\Component;

#[TypeScript]
#[AsComponent('sample.dual-a')]
final class SampleDualMarkedA extends Component {}

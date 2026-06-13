<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\TypeScript;

use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Core\Components\ContainerComponent;

#[Component('sample.widget')]
class SampleComponent extends ContainerComponent {}

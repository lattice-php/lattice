<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\TypeScript;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Components\ContainerComponent;

#[AsComponent('sample.widget')]
class SampleComponent extends ContainerComponent {}

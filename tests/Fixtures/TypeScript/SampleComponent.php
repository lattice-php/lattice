<?php

namespace Lattice\Lattice\Tests\Fixtures\TypeScript;

use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Core\Components\Component as BaseComponent;

#[Component('sample.widget', container: true)]
class SampleComponent extends BaseComponent {}

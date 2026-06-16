<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\TypeScript;

use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Components\Field;

#[AsField('sample')]
class SampleField extends Field {}

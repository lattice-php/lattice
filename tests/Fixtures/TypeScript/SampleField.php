<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\TypeScript;

use Lattice\Form\Attributes\AsField;
use Lattice\Form\Components\Field;

#[AsField('sample')]
class SampleField extends Field {}

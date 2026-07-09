<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\Discovery;

use Attribute;
use Lattice\Lattice\Attributes\DefinitionAttribute;

#[Attribute(Attribute::TARGET_CLASS)]
final class AsWidget extends DefinitionAttribute {}

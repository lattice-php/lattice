<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\Discovery;

use Attribute;
use Lattice\Core\Attributes\DefinitionAttribute;

#[Attribute(Attribute::TARGET_CLASS)]
final class AsWidget extends DefinitionAttribute {}

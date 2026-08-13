<?php
declare(strict_types=1);

namespace Lattice\Search;

use Attribute;
use Lattice\Core\Attributes\DefinitionAttribute;

#[Attribute(Attribute::TARGET_CLASS)]
final class AsSearchProvider extends DefinitionAttribute {}

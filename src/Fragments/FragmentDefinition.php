<?php
declare(strict_types=1);

namespace Lattice\Lattice\Fragments;

use Lattice\Lattice\Core\Definition;
use Lattice\Lattice\Core\PageSchema;

abstract class FragmentDefinition extends Definition
{
    abstract public function schema(PageSchema $schema): PageSchema;
}

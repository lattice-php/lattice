<?php
declare(strict_types=1);

namespace Lattice\Fragments;

use Lattice\Core\Definition;
use Lattice\Ui\PageSchema;

abstract class FragmentDefinition extends Definition
{
    abstract public function schema(PageSchema $schema): PageSchema;
}

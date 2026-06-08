<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Fragments;

use Bambamboole\Lattice\Definition;
use Bambamboole\Lattice\PageSchema;

abstract class FragmentDefinition extends Definition
{
    abstract public function schema(PageSchema $schema): PageSchema;
}

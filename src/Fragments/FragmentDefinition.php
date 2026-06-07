<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Fragments;

use Bambamboole\Lattice\PageSchema;

abstract class FragmentDefinition
{
    abstract public function schema(PageSchema $schema): PageSchema;
}

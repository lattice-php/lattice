<?php

declare(strict_types=1);

namespace Lattice\Lattice\Fragments;

use Lattice\Lattice\Core\Definition;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Fragments\Contracts\ProvidesSchema;

abstract class FragmentDefinition extends Definition implements ProvidesSchema
{
    abstract public function schema(PageSchema $schema): PageSchema;
}

<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Fragments;

use Bambamboole\Lattice\Contracts\ProvidesSchema;
use Bambamboole\Lattice\Definition;
use Bambamboole\Lattice\PageSchema;

abstract class FragmentDefinition extends Definition implements ProvidesSchema
{
    abstract public function schema(PageSchema $schema): PageSchema;
}

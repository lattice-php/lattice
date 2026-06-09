<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Fragments;

use Bambamboole\Lattice\Core\Definition;
use Bambamboole\Lattice\Core\PageSchema;
use Bambamboole\Lattice\Fragments\Contracts\ProvidesSchema;

abstract class FragmentDefinition extends Definition implements ProvidesSchema
{
    abstract public function schema(PageSchema $schema): PageSchema;
}

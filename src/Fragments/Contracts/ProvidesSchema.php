<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Fragments\Contracts;

use Bambamboole\Lattice\Core\PageSchema;

interface ProvidesSchema
{
    public function schema(PageSchema $schema): PageSchema;
}

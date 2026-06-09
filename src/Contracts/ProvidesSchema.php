<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Contracts;

use Bambamboole\Lattice\Core\PageSchema;

interface ProvidesSchema
{
    public function schema(PageSchema $schema): PageSchema;
}

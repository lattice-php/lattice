<?php
declare(strict_types=1);

namespace Lattice\Lattice\Fragments\Contracts;

use Lattice\Lattice\Core\PageSchema;

interface ProvidesSchema
{
    public function schema(PageSchema $schema): PageSchema;
}

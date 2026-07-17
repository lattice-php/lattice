<?php
declare(strict_types=1);

namespace Lattice\Lattice\Layouts;

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Definition;
use Lattice\Lattice\Core\PageSchema;

abstract class LayoutDefinition extends Definition
{
    abstract public function schema(PageSchema $schema, Request $request): PageSchema;
}

<?php
declare(strict_types=1);

namespace Lattice\Layouts;

use Illuminate\Http\Request;
use Lattice\Core\Definition;
use Lattice\Ui\PageSchema;

abstract class LayoutDefinition extends Definition
{
    abstract public function schema(PageSchema $schema, Request $request): PageSchema;
}

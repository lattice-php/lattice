<?php
declare(strict_types=1);

namespace Lattice\Lattice\Layouts;

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Definition;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Layouts\Contracts\ProvidesLayout;

abstract class LayoutDefinition extends Definition implements ProvidesLayout
{
    abstract public function schema(PageSchema $schema, Request $request): PageSchema;
}

<?php

declare(strict_types=1);

namespace Lattice\Lattice\Layouts\Contracts;

use Illuminate\Http\Request;
use Lattice\Lattice\Core\PageSchema;

interface ProvidesLayout
{
    /**
     * Build the layout shell. The returned schema must contain exactly one
     * Outlet, marking where the active page's content is rendered.
     */
    public function schema(PageSchema $schema, Request $request): PageSchema;
}

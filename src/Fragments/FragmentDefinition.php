<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Fragments;

use Bambamboole\Lattice\PageSchema;
use Illuminate\Http\Request;

abstract class FragmentDefinition
{
    abstract public function schema(PageSchema $schema): PageSchema;

    public function authorize(Request $request): bool
    {
        return true;
    }
}

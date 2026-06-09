<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Contracts;

use Illuminate\Http\Request;

interface Authorizable
{
    public function authorize(Request $request): bool;
}

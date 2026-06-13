<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Contracts;

use Illuminate\Http\Request;

interface Authorizable
{
    public function authorize(Request $request): bool;
}

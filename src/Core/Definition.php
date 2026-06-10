<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core;

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Contracts\Authorizable;

abstract class Definition implements Authorizable
{
    public function authorize(Request $request): bool
    {
        return true;
    }

    protected function context(Request $request, string $key, mixed $default = null): mixed
    {
        return data_get($request->input('context', []), $key, $default);
    }
}

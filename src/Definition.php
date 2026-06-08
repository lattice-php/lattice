<?php

declare(strict_types=1);

namespace Bambamboole\Lattice;

use Illuminate\Http\Request;

abstract class Definition
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

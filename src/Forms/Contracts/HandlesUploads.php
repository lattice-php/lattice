<?php

declare(strict_types=1);

namespace Lattice\Lattice\Forms\Contracts;

use Illuminate\Http\Request;

interface HandlesUploads
{
    /**
     * @return array{key: string, url: string, headers: array<string, mixed>, method: string}
     */
    public function signUpload(Request $request): array;
}

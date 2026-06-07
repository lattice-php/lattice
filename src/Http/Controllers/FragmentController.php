<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Http\Controllers;

use Bambamboole\Lattice\Fragments\FragmentRegistry;
use Illuminate\Http\JsonResponse;

class FragmentController
{
    public function __construct(private readonly FragmentRegistry $fragments) {}

    public function __invoke(string $fragment): JsonResponse
    {
        return response()->json($this->fragments->response($fragment));
    }
}

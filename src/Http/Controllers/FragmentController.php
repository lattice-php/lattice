<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Http\Controllers;

use Bambamboole\Lattice\Concerns\InteractsWithLatticeComponents;
use Bambamboole\Lattice\Contracts\SignsComponentReferences;
use Bambamboole\Lattice\Fragments\FragmentRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FragmentController
{
    use InteractsWithLatticeComponents;

    public function __construct(
        private readonly FragmentRegistry $fragments,
        private readonly SignsComponentReferences $references,
    ) {}

    public function __invoke(Request $request, string $fragment): JsonResponse
    {
        [, $definition] = $this->authorizeComponent($request, $this->references, $this->fragments, 'fragment', $fragment);

        return response()->json($this->fragments->response($fragment, $definition));
    }
}

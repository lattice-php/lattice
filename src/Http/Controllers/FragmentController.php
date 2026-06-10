<?php

declare(strict_types=1);

namespace Lattice\Lattice\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Lattice\Lattice\Core\Concerns\InteractsWithLatticeComponents;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Lattice\Fragments\FragmentRegistry;

final class FragmentController
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

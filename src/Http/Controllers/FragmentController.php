<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Http\Controllers;

use Bambamboole\Lattice\Fragments\FragmentRegistry;
use Bambamboole\Lattice\Security\ComponentReferenceSigner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FragmentController
{
    public function __construct(
        private readonly FragmentRegistry $fragments,
        private readonly ComponentReferenceSigner $references,
    ) {}

    public function __invoke(Request $request, string $fragment): JsonResponse
    {
        $request = $this->references->mergeTrustedContext($request, 'fragment', $fragment);
        $definition = $this->fragments->resolve($fragment);

        abort_unless($definition->authorize($request), 403);

        return response()->json($this->fragments->response($fragment, $definition));
    }
}

<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Http\Controllers;

use Bambamboole\Lattice\Actions\ActionRegistry;
use Bambamboole\Lattice\Concerns\InteractsWithLatticeComponents;
use Bambamboole\Lattice\Contracts\SignsComponentReferences;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActionController
{
    use InteractsWithLatticeComponents;

    public function __construct(
        private readonly ActionRegistry $actions,
        private readonly SignsComponentReferences $references,
    ) {}

    public function __invoke(Request $request, string $action): JsonResponse
    {
        [$request, $definition] = $this->authorizeComponent($request, $this->references, $this->actions, 'action', $action);

        return response()->json(
            $definition->handle($request)->toArray(),
        );
    }
}

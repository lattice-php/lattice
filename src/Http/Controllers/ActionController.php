<?php

declare(strict_types=1);

namespace Lattice\Lattice\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Lattice\Lattice\Actions\ActionRegistry;
use Lattice\Lattice\Core\Concerns\InteractsWithLatticeComponents;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;

final class ActionController
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

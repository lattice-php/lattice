<?php
declare(strict_types=1);

namespace Lattice\Tree;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Lattice\Lattice\Core\Concerns\InteractsWithComponents;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;

final readonly class TreeController
{
    use InteractsWithComponents;

    public function __construct(
        private TreeRegistry $trees,
        private SignsComponentReferences $references,
    ) {}

    public function __invoke(Request $request, string $tree): JsonResponse
    {
        [$request, $definition] = $this->authorizeComponent($request, $this->references, $this->trees, 'tree', $tree);

        return response()->json($this->trees->response($tree, $request, $definition));
    }
}

<?php

declare(strict_types=1);

namespace Lattice\Lattice\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Lattice\Lattice\Core\Concerns\InteractsWithLatticeComponents;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Lattice\Tables\TableRegistry;

final class TableController
{
    use InteractsWithLatticeComponents;

    public function __construct(
        private readonly TableRegistry $tables,
        private readonly SignsComponentReferences $references,
    ) {}

    public function __invoke(Request $request, string $table): JsonResponse
    {
        [$request, $definition] = $this->authorizeComponent($request, $this->references, $this->tables, 'table', $table);

        return response()->json($this->tables->response($table, $request, $definition));
    }
}

<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Http\Controllers;

use Bambamboole\Lattice\Concerns\InteractsWithLatticeComponents;
use Bambamboole\Lattice\Security\ComponentReferenceSigner;
use Bambamboole\Lattice\Tables\InvalidTableQuery;
use Bambamboole\Lattice\Tables\TableRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TableController
{
    use InteractsWithLatticeComponents;

    public function __construct(
        private readonly TableRegistry $tables,
        private readonly ComponentReferenceSigner $references,
    ) {}

    public function __invoke(Request $request, string $table): JsonResponse
    {
        [$request, $definition] = $this->authorizeComponent($request, $this->references, $this->tables, 'table', $table);

        try {
            return response()->json($this->tables->response($table, $request, $definition));
        } catch (InvalidTableQuery $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }
    }
}

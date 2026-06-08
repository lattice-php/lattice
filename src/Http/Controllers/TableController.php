<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Http\Controllers;

use Bambamboole\Lattice\Security\ComponentReferenceSigner;
use Bambamboole\Lattice\Tables\InvalidTableQuery;
use Bambamboole\Lattice\Tables\TableRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TableController
{
    public function __construct(
        private readonly TableRegistry $tables,
        private readonly ComponentReferenceSigner $references,
    ) {}

    public function __invoke(Request $request, string $table): JsonResponse
    {
        $request = $this->references->mergeTrustedContext($request, 'table', $table);
        $definition = $this->tables->resolve($table);

        abort_unless($definition->authorize($request), 403);

        try {
            return response()->json($this->tables->response($table, $request, $definition));
        } catch (InvalidTableQuery $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }
    }
}
